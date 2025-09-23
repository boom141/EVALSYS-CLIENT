import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OverviewComponent } from './features/overview/overview.component';
import { FacultyComponent } from './features/faculty/faculty.component';
import { CommonModule } from '@angular/common';
import { Navigation_Service } from '../core/services/navigation.service';
import { Auth_Service } from '../core/services/auth.service';

@Component({
  selector: 'app-admin',
  imports: [RouterOutlet, OverviewComponent, FacultyComponent, CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
    private _navigation = inject(Navigation_Service)
    private _auth_service = inject(Auth_Service)

    get active_link(){
      return this._navigation.get_current_link()
    }

    get current_username(){
      return this._auth_service.getUser().name
    }

    navigate_link(link:string){
      this._navigation.navigate_to_link(link)
    }

    handle_signout(){
      this._auth_service.sign_out()
      this._navigation.navigate_to_link()
    }
    
}
