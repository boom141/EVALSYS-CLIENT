import { inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class Auth_Service{

    setUser(data: any){
        localStorage.setItem('sessionUser', JSON.stringify(data))
    }

    // updateUser(data: any){
    //     let userData = this.getUser()
    //     this.setUser({
    //         ...userData,
    //         ...data
    //     })
    // }


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