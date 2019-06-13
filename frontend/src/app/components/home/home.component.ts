import { Component, OnInit } from '@angular/core';

import { FileService } from './../../services/file.service';
import { ValidateService } from './../../services/validate.service';
import { TimeService } from 'src/app/services/time.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {

  loadMessage: String;
  directoryHelp: String;
  fileHelp: String;

  directory: String;  
  csvPath: String;
  isLoading: Boolean;
  hideModal: Boolean = true;
  message: String;
  startDate: String;

  constructor(
    private fileService: FileService,
    private validateService: ValidateService,    
    private timeService: TimeService,
    private modalService: NgbModal
  ) { }

  ngOnInit() { 
    this.directoryHelp = "Please provide the parent path of the files to be renamed (Ex. \\\\wcnet\\firm\\Admin\\ASIAPAC\\1189995_Knowledge_Department\\0001_General\\DMT\\4.1305).";
    this.fileHelp = "Please provide the full path of the Document Data csv file (Ex. \\\\wcnet\\firm\\Admin\\ASIAPAC\\1189995_Knowledge_Department\\0001_General\\DMT\\4.1305\\20181120092938_DocData.csv).";
  }

  onSubmitRename(){
    let directory = this.directory;
    let csvPath = this.csvPath;

    this.loadMessage = "Files under \"" + directory + "\" are being renamed, time started: " + new Date().toLocaleString() + ".";

    // Validate Required Fields
    if (!this.validateService.isValidForm(directory, csvPath)) {      

      const modalRef = this.modalService.open(ModalComponent);
      modalRef.componentInstance.title = 'Error';
      modalRef.componentInstance.message = 'Please fill out the required fields.';
      
      return false;
    }

    this.isLoading = true;

    // Rename Files
    this.fileService.renameFiles(directory, csvPath).toPromise().then((res) => {
      
      let response = res;

      this.isLoading = false;

      if (res["status"] == "error") {
        
        let messages = response["message"];        
        messages = messages.join("\n\n");

        const modalRef = this.modalService.open(ModalComponent);
        modalRef.componentInstance.title = 'Error';
        modalRef.componentInstance.message = messages;

      } 

      if(res["status"] == "success") {
        
        //let filesFound = res["filesFound"];
        let renamedFiles = res["renamedFiles"];
        let startDate = res["startDate"];

        let now = new Date().getTime();
        let startTime = new Date(startDate).getTime();        
        let elapsed = Math.abs(now - startTime);        
        
        let formattedTime = this.timeService.convertToString(elapsed);        

        let message = "";
        if (renamedFiles == 0) {
          message = renamedFiles + " files were renamed. No files matched the Document Data list.\n\nEither the Parent Directory has been processed already or you are using an incorrect Document Data."
        } else {
          message = "File(s) renamed: " + renamedFiles + ".\nTotal elapsed time: " + formattedTime;
        }

        const modalRef = this.modalService.open(ModalComponent);
        modalRef.componentInstance.message = message;
        
        //this.onClear();
      }
    });
  }

  onClear() {
    this.directory = "";
    this.csvPath = "";
  }

  onCountFiles() {

    let directory = this.directory;
    let csvPath = this.csvPath;

    this.isLoading = true;
    this.loadMessage = "Counting files to be renamed in: \"" + directory + "\", please wait.";

    this.fileService.countFiles(directory, csvPath).toPromise().then((res) => {

      let response = res;

      this.isLoading = false;

      if (res["status"] == "error") {
        
        let messages = response["message"];        
        messages = messages.join("\n\n");

        const modalRef = this.modalService.open(ModalComponent);
        modalRef.componentInstance.title = 'Error';
        modalRef.componentInstance.message = messages;

      } 

      if(res["status"] == "success") {
        
        let filesFoundInDocData = res["filesFoundInDocData"];
        let filesFound = res["filesFound"];
        let startDate = res["startDate"];
        let filesToBeRenamed = res["filesToBeRenamed"];

        let now = new Date().getTime();
        let startTime = new Date(startDate).getTime();        
        let elapsed = Math.abs(now - startTime);        
        
        let formattedTime = this.timeService.convertToString(elapsed);        

        let message = "File(s) found in Parent Directory: " + filesFound + ".\nFile(s) found in Document Data: " + filesFoundInDocData + ".\nFile(s) to be renamed: " + filesToBeRenamed + ".";

        const modalRef = this.modalService.open(ModalComponent);
        modalRef.componentInstance.message = message;
                
      }

    });
  }

}