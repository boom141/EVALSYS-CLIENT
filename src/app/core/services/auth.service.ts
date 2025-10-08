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
        if(session_forms){
            session_forms = {...session_forms}
        }else{
            session_forms = {}
        }
       sessionStorage.setItem('sessionForms', JSON.stringify(session_forms))
    }

    get_forms(){
        return JSON.parse(sessionStorage.getItem('userforms') as string)   
    }

    update_forms(data:string){
        const session_forms = this.get_forms()
        sessionStorage.setItem('sessionForms', JSON.stringify({...session_forms, [data]: true}))
    }

    getUser(){
        return JSON.parse(localStorage.getItem('sessionUser') as string)   
    }

    clearSession(){
        localStorage.removeItem('sessionUser')

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