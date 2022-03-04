const { MODE } = require("./blendMode.js");
const description = "This is the description of your NFT project";
const baseUri = "https://hashlips/nft";

const layerConfigurations = [
  {
    growEditionSizeTo: 5,
  },
];

// const format = {
//   width: 512,
//   height: 512,
// };

// const background = {
//   generate: true,
//   brightness: "80%",
// };

// const rarityDelimiter = "#";

// const uniqueDnaTorrance = 10000;

module.exports = {
  // format,
  baseUri,
  description,
  // background,
  // uniqueDnaTorrance,
  layerConfigurations,
  // rarityDelimiter,
};
