import { EventEmitter, Injectable } from "@angular/core";
import { ToastMessageOptions } from "primeng/api";

@Injectable({
    providedIn: 'root'
})
export class ToastService{
    setToast = new EventEmitter()
    
    show(options: ToastMessageOptions){
        this.setToast.emit(options)
    }
    
}