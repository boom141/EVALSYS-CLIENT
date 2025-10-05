import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService, ToastMessageOptions } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ToastService } from './core/services/toast.service';
import { LoadingService } from './core/services/loading.service';
import { ReportTemplateComponent } from "./shared/components/report-template/report-template.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, ReportTemplateComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [MessageService]
})
export class AppComponent {

    private _loadingService = inject(LoadingService)
    private _toast_service = inject(ToastService);
    private _message_service = inject(MessageService)

    public is_loading: boolean = false

    ngOnInit(): void {
      this._loadingService.setLoading.subscribe(value =>{
        this.is_loading = value
      })
      
      this._toast_service.setToast.subscribe((data:ToastMessageOptions) => {
            this._message_service.add({
            severity: data.severity,
            summary: data.summary,
            detail: data.detail,
            key: 'br',
            life: 3000,
          });
      })
      
    }

}
