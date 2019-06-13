const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');
const csv = require('csvtojson');

// Count Files
router.get('/countFilesToRename', async (req, res, next) => {

    let startDate = new Date();

    let folderPath = req.query.folderPath;
    folderPath = decodeURIComponent(decodeURI(folderPath));

    let csvPath = req.query.csvPath;
    csvPath = decodeURIComponent(decodeURI(csvPath));

    let errList = [];

    if (!fs.existsSync(folderPath)) {        
        errList.push("Cannot find \"" + folderPath + "\". Please check if the directory you provided exists and is accessible.");
    } else {
        if (!fs.lstatSync(folderPath).isDirectory) {            
            errList.push("Cannot find \"" + folderPath + "\". Please check if the directory you provided exists and is accessible.");
        }
    }    

    if (!fs.existsSync(csvPath)) {        
        //errList.push("Please provide a valid Document Data  in csv file format.");
        errList.push("Cannot find \"" + csvPath + "\". Please provide a valid Document Data  in csv file format.");
    } else {
        if (!fs.lstatSync(csvPath).isFile) {            
            errList.push("Unexpected file: \"" + csvPath + "\".Please provide a valid Document Data  in csv file format.");
        }
    }

    if (errList.length > 0) {        
        res.send({"status":"error", "message":errList});
        return;
    }

    let filesForRenaming = await getFilesForRenaming(csvPath);    
    let fileCounter = 0;    
    let filesToBeRenamed = 0;

    await asyncWalk(folderPath, function(err, results) {

        if (err) throw err;            

        results.forEach(file => {
            
            if (fs.lstatSync(file).isFile) {
                fileCounter++;
            }

            if (!filesForRenaming[path.basename(file)]) {                
                //In a javascript forEach loop,
                //return is the equivalent of continue
                //https://stackoverflow.com/questions/31399411/go-to-next-iteration-in-javascript-foreach-loop
                return;
            }            
            
            filesToBeRenamed++;
                
        });

        if (Object.keys(errList).length > 0) {
            res.send({"status":"error", "errors": errList});
        } else {            
            res.send({
                "status":"success",
                "filesFoundInDocData": Object.keys(filesForRenaming).length,
                "filesFound": fileCounter,
                "filesToBeRenamed": filesToBeRenamed,
                "startDate": startDate
            });
        }
    });

});

// Rename Files
router.get('/renameFiles', async (req, res, next) => {

    let startDate = new Date();

    let folderPath = req.query.folderPath;
    folderPath = decodeURIComponent(decodeURI(folderPath));

    let csvPath = req.query.csvPath;
    csvPath = decodeURIComponent(decodeURI(csvPath));

    let errList = [];

    if (!fs.existsSync(folderPath)) {        
        errList.push("Cannot find \"" + folderPath + "\". Please check if the directory you provided exists and is accessible.");
    } else {
        if (!fs.lstatSync(folderPath).isDirectory) {            
            errList.push("Cannot find \"" + folderPath + "\". Please check if the directory you provided exists and is accessible.");
        }
    }    

    if (!fs.existsSync(csvPath)) {        
        //errList.push("Please provide a valid Document Data  in csv file format.");
        errList.push("Cannot find \"" + csvPath + "\". Please provide a valid Document Data  in csv file format.");
    } else {
        if (!fs.lstatSync(csvPath).isFile) {            
            errList.push("Unexpected file: \"" + csvPath + "\".Please provide a valid Document Data  in csv file format.");
        }
    }

    if (errList.length > 0) {        
        res.send({"status":"error", "message":errList});
        return;
    }

    let filesForRenaming = await getFilesForRenaming(csvPath);
    
    let fileCounter = 0;
    let renamedFiles = 0;

    await walk(folderPath, function(err, results) {

        if (err) throw err;            

        results.forEach(file => {
            
            if (fs.lstatSync(file).isFile) {
                fileCounter++;
            }
            
            let fileBasename = path.basename(file);
            let filePath = path.dirname(file);

            if (!filesForRenaming[path.basename(file)]) {
                //In a javascript forEach loop,
                //return is the equivalent of continue
                //https://stackoverflow.com/questions/31399411/go-to-next-iteration-in-javascript-foreach-loop
                return;
            }

            let description = filesForRenaming[path.basename(file)].description;

            // Process instances where the absolute file name exceeds 255 characters.
            let tempNewName = path.resolve(filePath, description + "_" + fileBasename);            
            let tempNewNameLength = tempNewName.length;
            let newName = '';            

            if (tempNewNameLength > 255) {
                let excess = 254 - tempNewNameLength;
                if (description.length > Math.abs(excess)) {
                    description = description.substring(0, (description.length - Math.abs(excess)));
                }
                newName = path.resolve(filePath, description + "_" + fileBasename);                
            } else {
                newName = tempNewName;
            }

            renamedFiles++;
            // Actual File Renaming
            fs.renameSync(file, newName, (err) => {
                if (err) { 
                    errList.push(err);
                }
                renamedFiles++;
            });
                        
            /*
            fs.unlink(file, (err) => {
                if (err) { 
                    errList.push(err);
                }
                renamedFiles++;
            });
            */

        });

        if (Object.keys(errList).length > 0) {
            res.send({"status":"error", "errors": errList});
        } else {
            res.send({
                "status":"success",
                "filesFoundInDocData": Object.keys(filesForRenaming).length,
                "filesFound": fileCounter,
                "renamedFiles": renamedFiles,
                "startDate": startDate
            });
        }
    });

});

function cleanUpString(str) {
    return str.replace(/[:;/\\?%*|"<>]/g, '_');
}

function walk (dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
      if (err) return done(err);
      var pending = list.length;
      if (!pending) return done(null, results);
      list.forEach(function(file) {
        file = path.resolve(dir, file);
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            walk(file, function(err, res) {
              results = results.concat(res);
              if (!--pending) done(null, results);
            });
          } else {
            results.push(file);
            if (!--pending) done(null, results);
          }
        });
      });
    });
    return results;
};

function asyncWalk (dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
      if (err) return done(err);
      var pending = list.length;
      if (!pending) return done(null, results);
      list.forEach(function(file) {
        file = path.resolve(dir, file);
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            asyncWalk(file, function(err, res) {
              results = results.concat(res);
              if (!--pending) done(null, results);
            });
          } else {
            results.push(file);
            if (!--pending) done(null, results);
          }
        });
      });
    });
  };

async function getFilesForRenaming(csvPath) {
    let filesToProcess = await csv().fromFile(csvPath);
    let filesForRenaming = {};

    for (let key in filesToProcess) {            
        let fileFull = filesToProcess[key].Path;        
        let fileName = path.basename(fileFull);
        let description = filesToProcess[key].Description;
        filesForRenaming[fileName] = {                    
            "oldName": fileName,
            "description": cleanUpString(description)
        };            
    }
    return filesForRenaming;
}

module.exports = router;