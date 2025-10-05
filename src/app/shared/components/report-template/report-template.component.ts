import {
  Component,
  ElementRef,
  inject,
  ViewChild,
  viewChild,
} from '@angular/core';
import { ReportTemplateService } from '../../../core/services/report_template.service';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-report-template',
  imports: [],
  templateUrl: './report-template.component.html',
  styleUrl: './report-template.component.scss',
})
export class ReportTemplateComponent {
  private _report_template_service = inject(ReportTemplateService);

  @ViewChild('template') template_container!: ElementRef<HTMLDivElement>;
  public filename!: string;
  report_data: any = null;

  ngAfterViewInit(): void {
    this._report_template_service.set_report_event.subscribe((res: any) => {
      this.report_data = res;
      this.filename = res.department_name;
      setTimeout(() => {
        if (this.report_data) {
          this.save_report();
        }
      }, 500);
    });
  }

  save_report() {
    const opt = {
      margin: 10,
      filename: `${this.get_current_date_ISO()}_${this.filename.replace(/ /g, '_')}_report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(this.template_container.nativeElement).save();
  }

  get_current_date_ISO(): string {
    const now = new Date();
    return now.toISOString().split('T')[0]; 
  }
}
