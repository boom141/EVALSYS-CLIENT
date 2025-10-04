import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Navigation_Service } from '../../../core/services/navigation.service';
import { Auth_Service } from '../../../core/services/auth.service';
import { dev_config } from '../../../environments/dev.env';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private _api = inject(HttpClient)
  private _navigation = inject(Navigation_Service)
  private _auth_service = inject(Auth_Service)

  handle_signin(username:string, password:string){
    this._api.post(`${dev_config.api_base_url}/auth`, { username, password })
    .subscribe(
      (res:any) => {
        this._auth_service.sign_in(res)
        console.log(res)
        switch(res.role){
          case 'admin':
            this._navigation.navigate_to_link('admin/overview')
          break;
          case 'student':
            this._navigation.navigate_to_link('student')
          break;
          case 'faculty':
            this._navigation.navigate_to_link('faculty-main')
          break;
        }
        
      },
      err => console.log(err)
    )
  }
}
