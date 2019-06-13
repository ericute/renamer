import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private http: HttpClient
  ) { }
  
  renameFiles(folderPath, csvPath) {
    
    // Headers
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    
    // Params
    let params = {
      'folderPath': encodeURIComponent(folderPath),      
      'csvPath': encodeURIComponent(csvPath)
    }
    
    return this.http.get('http://localhost:3000/services/renameFiles',
      {'headers': headers, 'params': params})
      .map(async (res) => {        
        //console.log('File service!');
        return await res;
      });
    
  }

  countFiles(folderPath, csvPath) {
    
    // Headers
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    // Params
    let params = {
      'folderPath': encodeURIComponent(folderPath),      
      'csvPath': encodeURIComponent(csvPath)
    }

    return this.http.get('http://localhost:3000/services/countFilesToRename',
      {'headers': headers, 'params': params})
      .map(async (res) => {        
        //console.log('File service!');
        return await res;
      });
    
  }
}
