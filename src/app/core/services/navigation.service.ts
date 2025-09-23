import { EventEmitter, inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})

export class Navigation_Service{
    public navigate: EventEmitter<string> = new EventEmitter()
    
    private current_link!: string
    private _router = inject(Router)

    constructor(){
        this.set_current_link(window.location.pathname.split('/')[2])
    }
    
    get_current_link(){
        return this.current_link
    }

    set_current_link(link:string){
        this.current_link = link
    }

    navigate_to_link(link:string = ''){
        this.set_current_link(link)
        this._router.navigate([`/${link}`])
    }
}