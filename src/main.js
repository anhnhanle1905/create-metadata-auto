const fs = require("fs");
const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const buildDir = `${basePath}/build`;

const axios = require("axios");
const FormData = require("form-data");
const recursive = require("recursive-fs");
const basePathConverter = require("base-path-converter");
const pinataApiKey = "fc2053b7dd1ea319483c";
const pinataSecretApiKey =
  "a4ac340b33a89b27eb821b9f6f9fa0ef501c0ad24982729e8b810e1a5b6c49f5";

const { description, layerConfigurations } = require(path.join(
  basePath,
  "/src/config.js"
));
const console = require("console");
var metadataList = [];

const pinataApi = require("../pinata-api");
// pinataApi.pinDirectoryToIPFS("nhannft2");
// const hashIPFS = fs.readFileSync("hashIPFS.txt").toString();

const pinDirectoryToIPFS = async (nameFolderUpload) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const src = `./${nameFolderUpload}`;

  var { files } = await recursive.readdirr(src);
  let data = new FormData();
  files.forEach((file) => {
    //for each file stream, we need to include the correct relative file path
    data.append(`file`, fs.createReadStream(file), {
      filepath: basePathConverter(src, file),
    });
  });

  const metadata = JSON.stringify({
    name: "FolderImages",
    keyvalues: {
      exampleKey: "exampleValue",
    },
  });
  data.append("pinataMetadata", metadata);

  try {
    const res = await axios.post(url, data, {
      maxBodyLength: "Infinity", //this is needed to prevent axios from erroring out with large directories
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    });
    let dataHash = res.data.IpfsHash;
    fs.appendFileSync("hashIPFS.txt", dataHash + "\n");

    // console.log(await MESS(res.data.IpfsHash));
    buildSetup();
    startCreating(res.data.IpfsHash);
    return {
      success: true,
      pinataUrl: "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
};
pinDirectoryToIPFS("nhannft2");

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
};

const addMetadata = async (_edition, _hashIPFS) => {
  let tempMetadata = {
    name: `#${_edition}`,
    description: description,
    image: `https://gateway.pinata.cloud/ipfs/${_hashIPFS}/${_edition}.jpeg`,
    // image: _hashIPFS,
    edition: _edition,
    attributes: [
      {
        abc: "hehe",
        xyz: "haha",
      },
    ],
    compiler: "Nhan Le",
  };
  metadataList.push(tempMetadata);
  attributesList = [];
};

const writeMetaData = (_data) => {
  fs.writeFileSync(`${buildDir}/_metadata.json`, _data);
};

const saveMetaDataSingleFile = (_editionCount) => {
  fs.writeFileSync(
    `${buildDir}/${_editionCount}.json`,
    JSON.stringify(
      metadataList.find((meta) => meta.edition == _editionCount),
      null,
      2
    )
  );
};

const startCreating = async (_hashIPFS) => {
  let layerConfigIndex = 0;
  let editionCount = 1;
  while (layerConfigIndex < layerConfigurations.length) {
    while (
      editionCount <= layerConfigurations[layerConfigIndex].growEditionSizeTo
    ) {
      addMetadata(editionCount, _hashIPFS);
      saveMetaDataSingleFile(editionCount);
      console.log(`Created metadata: ${editionCount}`);
      editionCount++;
    }
    layerConfigIndex++;
  }
  writeMetaData(JSON.stringify(metadataList, null, 2));
};

module.exports = { startCreating, buildSetup };
