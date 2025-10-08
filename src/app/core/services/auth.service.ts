import { inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class Auth_Service{

    setUser(data: any){
        localStorage.setItem('sessionUser', JSON.stringify(data))
    }

    set_forms(){
        let session_forms = this.get_forms()
        if(session_forms === null){
            localStorage.setItem('sessionForms', JSON.stringify({}))
        }
    }

    get_forms(){
        return JSON.parse(localStorage.getItem('sessionForms') as string)   
    }

    update_forms(data:string){
        const session_forms = this.get_forms()
        console.log(session_forms)
        session_forms[data] = true
        localStorage.setItem('sessionForms', JSON.stringify(session_forms))
    }

    getUser(){
        return JSON.parse(localStorage.getItem('sessionUser') as string)   
    }

    clearSession(){
        localStorage.removeItem('sessionUser')
        localStorage.removeItem('sessionForms')
    }

    isAuthenticated(){
        return this.getUser() || false
    }


    async sign_in(data:any): Promise<any>{
        this.setUser(data)
    }

    sign_out(){
        this.clearSession()
    }
}