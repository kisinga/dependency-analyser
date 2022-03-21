// This script works by comparing 2 package lockfiles and lists the dependency differences,
// as well as locked versions (If any) and lists their version differences
// It expects the relative filepath of the source, the target and the output location.
// Results are timestamped from system time

/* Example: 
node .\index.js ../OneShell/src ../1JS/midgard
*/

const fs = require("fs");

// trim unnecessary vars
var args = process.argv.slice(2);

// fail early if an arguement is missing
if (args.length < 2) {
  // fail here
  console.log("Too few args provided");
}

var source = args[0];
var target = args[1];

// console.log(source);
// console.log(target);

// this function compares deps given two objects
function compareDeps(source, target, sourceName, targetName) {
  // search for the common deps
  var common = [];
  if (source === undefined || target === undefined) {
    return common;
  }

  Object.keys(source).forEach((sourcePackageName) => {
    Object.keys(target).forEach((targetPackageName) => {
      if (sourcePackageName === targetPackageName) {
        common.push({
          [sourcePackageName]: {
            [sourceName]: source[sourcePackageName],
            [targetName]: target[sourcePackageName],
          },
        });
      }
    });
  });
  return common;
}

// this function reads a file
function readLockfiles() {
  // fail early in case any of the files doesnt exist
  if (!fs.existsSync(source) || !fs.existsSync(target)) {
    if (!fs.existsSync(source) && !fs.existsSync(target)) {
      throw new Error("Error reading source and target lockfiles");
    } else if (!fs.existsSync(source)) {
      throw new Error("Error reading source lockfile");
    } else {
      throw new Error("Error reading target lockfile");
    }
  }

  const sourceData = JSON.parse(
    fs.readFileSync(`${source}/package.json`, { encoding: "utf-8" })
  );

  const targetData = JSON.parse(
    fs.readFileSync(`${target}/package.json`, { encoding: "utf-8" })
  );

  const sections = ["dependencies", "devDependencies", "resolutions"];

  for (section of sections) {
    console.log(
      `Common ${section} :\n `,
      compareDeps(sourceData[section], targetData[section], sourceData["name"], targetData["name"])
    );
  }
}

readLockfiles();
