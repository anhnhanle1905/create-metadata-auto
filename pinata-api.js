const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const recursive = require("recursive-fs");
const basePathConverter = require("base-path-converter");
const { async } = require("recursive-fs/lib/copy");
const pinataApiKey = "fc2053b7dd1ea319483c";
const pinataSecretApiKey =
  "a4ac340b33a89b27eb821b9f6f9fa0ef501c0ad24982729e8b810e1a5b6c49f5";

// let mess;

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
// const setMESS = async (image) => {
//   var mess = image;
//   const setMESS2 = async (_mess) => {
//     mess = _mess
//   };
// };

// console.log(mess);

// const MESS = mess;

module.exports = { pinDirectoryToIPFS };
