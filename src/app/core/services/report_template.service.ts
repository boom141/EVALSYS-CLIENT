import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ReportTemplateService {
    private report_subject = new BehaviorSubject<boolean>(false)
    set_report_event = this.report_subject.asObservable()

    set_report(data:any): void{
        this.report_subject.next(data)
    }
}