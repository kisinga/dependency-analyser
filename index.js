// This script works by comparing 2 package lockfiles and lists the dependency differences,
// as well as locked versions (If any) and lists their version differences
// It expects the relative filepath of the source, the target and the output location.
// Results are timestamped from system time

const fs = require("fs");
const compareVersions = require("compare-versions");

// console.log(source);
// console.log(target);
var mandatory_deps;

function check_mandatory(dependency, version) {
  result = {
    mandatory: "false",
    aligned: true,
  };
  if (mandatory_deps[dependency]) {
    var comparison = compareVersions(version, mandatory_deps[dependency]);
    if (comparison >= 0) {
      result = {
        mandatory: mandatory_deps[dependency],
        aligned: true,
      };
    } else {
      result = {
        mandatory: mandatory_deps[dependency],
        aligned: false,
      };
    }
  }
  return result;
}

// this function compares deps given two objects
function compareDeps(source, target, sourceName, targetName) {
  // search for the common deps
  var common = [];
  var mandatoryAligned = true;
  if (source === undefined || target === undefined) {
    return common;
  }

  Object.keys(source).forEach((sourcePackageName) => {
    // console.log("Source:", source, "Version:", source[sourcePackageName])

    // check if this dep is part of mandatory list and whether it's aligned
    mandatory = check_mandatory(sourcePackageName, source[sourcePackageName]);
    if (!mandatory.aligned) {
      mandatoryAligned = false;
    }
    if (target[sourcePackageName]) {
      common.push({
        ...{
          [sourcePackageName]: {
            [sourceName]: source[sourcePackageName],
            [targetName]: target[sourcePackageName],
          },
        },
        ...mandatory,
      });
    }
  });
  return { common, mandatoryAligned };
}

// this function reads a file
function readLockfiles(source, target, mandatory) {
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

  var results = {
    mandatoryAligned: true,
  };
  for (section of sections) {
    results[section] = compareDeps(
      sourceData[section],
      targetData[section],
      sourceData["name"],
      targetData["name"]
    );

    mandatory_deps = JSON.parse(
      fs.readFileSync(mandatory, { encoding: "utf-8" })
    );
    var results = {
      mandatoryAligned: true,
    };
    for (section of sections) {
      results[section] = compareDeps(
        sourceData[section],
        targetData[section],
        sourceData["name"],
        targetData["name"]
      );
      // Hoist the value of mandatoryAligned and make it false in case any section id=s not aligned
      if (!results[section].mandatoryAligned) {
        results.mandatoryAligned = false;
      }
    }
    console.log(results);
    return results;
  }
}

readLockfiles("../OneShell", "../1JS/midgard", "mandatory.json");
