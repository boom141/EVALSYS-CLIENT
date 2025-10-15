import { Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { chart } from 'highcharts';
import { dev_config } from '../../../environments/dev.env';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingService } from '../../../core/services/loading.service';
import { TooltipModule } from 'primeng/tooltip';
import { ReportTemplateService } from '../../../core/services/report_template.service';
import { Auth_Service } from '../../../core/services/auth.service';
@Component({
  selector: 'app-faculty',
  imports: [
    TableModule,
    ButtonModule,
    CommonModule,
    PaginatorModule,
    FormsModule,
    InputTextModule,
    CardModule,
    TooltipModule
  ],
  templateUrl: './faculty.component.html',
  styleUrl: './faculty.component.scss',
})
export class FacultyComponent {
  public first: number = 0;
  public rows: number = 5;
  public total_records!: number;
  public filtered_data: any[] = [];
  public source_data!: any[];
  public selected_faculty: any = null;
  public selected_section: any = null;

  public leaderboard_data: any;
  public barchart_data: any;
  public donut_data: any;
  public infocards_data: any;
  public postive_sentiments_data: any;
  public neutral_sentiments_data: any;
  public negative_sentiments_data: any;
  public filters: { [key: string]: string } = {};
  public selected_sem!: string
  public selected_sy!: string


  private _api = inject(HttpClient);
  private _toast_service = inject(ToastService);
  private _loadingService = inject(LoadingService);
  private _report_template_service = inject(ReportTemplateService)
  private _auth_service = inject(Auth_Service)
  

  ngAfterViewInit() {
    this.fetch_data();
  }
  
  on_select_sem(event:Event){
    this.selected_sem = (event.target as HTMLSelectElement).value
    this.fetch_data()

    setTimeout(() => {
      this.render_bar_chart();
      this.render_participation_score();
    }, 100);

  }

  on_select_sy(event:Event){
    this.selected_sy = (event.target as HTMLSelectElement).value
    this.fetch_data()

    setTimeout(() => {
      this.render_bar_chart();
      this.render_participation_score();
    }, 100);
  }


  fetch_data() {
    this._loadingService.show();
    const department_name = this._auth_service.getUser().department

    const params_obj:any = {}
    if (this.selected_sy) params_obj.school_year = this.selected_sy
    if (this.selected_sem) params_obj.semester = this.selected_sem
    if (department_name) params_obj.department_name = department_name    

    this._api
      .get(`${dev_config.api_base_url}/department`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        params: new HttpParams({fromObject: params_obj})
      })

      .subscribe(
        (res: any) => {
          this.source_data = res;
          this.total_records = this.source_data.length;
          this.filtered_data = [...this.source_data];
          this._loadingService.hide();
          this._toast_service.show({
            severity: 'success',
            summary: 'Departments',
            detail: 'Data Loaded Successfully',
          });
        },
        (err) => {
          this._loadingService.hide();
          this._toast_service.show({
            severity: 'error',
            summary: 'Departments',
            detail: 'Data Loaded Unsuccessfully',
          });
        }
      );
  }

  export_data(row_data:any){
    this._report_template_service.set_report(row_data)
  }

  getDataKeys() {
    return Object.keys(this.source_data[0]);
  }

  onPageChange(event: PaginatorState): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 5;
  }
  get pagedData(): any[] {
    return this.filtered_data.slice(this.first, this.first + this.rows);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  private flattenObjectToString(obj: any): string {
    let result: string[] = [];

    const recurse = (value: any) => {
      if (value === null || value === undefined) return;
      if (typeof value === 'object') {
        for (const key in value) {
          recurse(value[key]);
        }
      } else {
        result.push(value.toString().toLowerCase());
      }
    };

    recurse(obj);
    return result.join(' ');
  }

  onGlobalFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filterValue = input.value.trim().toLowerCase();

    this.applyGlobalFilter(filterValue);
  }

  private applyGlobalFilter(filterValue: string): void {
    if (!filterValue) {
      this.filtered_data = [...this.source_data]; // reset
      return;
    }

    this.filtered_data = this.source_data.filter((item: any) => {
      const flatString = this.flattenObjectToString(item);
      return flatString.includes(filterValue);
    });
  }

  select_faculty(row_data: any) {
    this.selected_faculty = row_data;
    this.leaderboard_data = this.selected_faculty.section_data;
    this.infocards_data = this.selected_faculty.overall_data.info_cards;
    this.barchart_data = this.selected_faculty.overall_data.sentiment_data;
    this.donut_data = this.selected_faculty.overall_data.participation_score;

    setTimeout(() => {
      this.render_bar_chart();
      this.render_participation_score();
    }, 100);
  }

  select_section(row_data: any) {
    this.selected_section = row_data;
    this.postive_sentiments_data =
      this.selected_section.data.sentiment_data.positive.feedbacks;
    this.neutral_sentiments_data =
      this.selected_section.data.sentiment_data.neutral.feedbacks;
    this.negative_sentiments_data =
      this.selected_section.data.sentiment_data.negative.feedbacks;
  }

  back_to_faculty() {
    this.selected_faculty = null;
  }

  render_bar_chart() {
    this.barchart_data = [
      {
        name: 'sentiment',
        data: [
          { y: this.barchart_data.positive.count, color: '#43900C' },
          { y: this.barchart_data.neutral.count, color: '#CECECE' },
          { y: this.barchart_data.negative.count, color: '#D21313' },
        ],
      },
    ];

    chart('sentiments_barchart', {
      chart: {
        type: 'column',
      },

      title: {
        text: '',
      },

      legend: {
        enabled: false,
      },

      xAxis: {
        categories: ['Positive', 'Neutral', 'Negative'],
        crosshair: true,
      },
      yAxis: {
        min: 0,
        title: {
          text: '',
        },
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          borderRadius: 0,
        },
      },
      series: this.barchart_data,
    });
  }

  render_participation_score() {
    this.donut_data = [
      {
        name: 'Participant',
        y: this.donut_data,
        color: '#43900C',
      },
      {
        name: 'Non-participant',
        y: 100.0 - this.donut_data,
        color: '#CECECE',
      },
    ];

    // @ts-ignore
    chart('participation_score', {
      chart: {
        type: 'pie',
        custom: {},
        events: {
          render() {
            const chart: any = this,
              series = chart.series[0];
            let customLabel = chart.options.chart.custom.label;

            if (!customLabel) {
              customLabel = chart.options.chart.custom.label = chart.renderer
                .label('Total<br/>' + '<strong>80%</strong>')
                .css({
                  color: 'var(--highcharts-neutral-color-100, #000)',
                  textAnchor: 'middle',
                })
                .add();
            }

            const x: any = series.center[0] + chart.plotLeft,
              y =
                series.center[1] +
                chart.plotTop -
                customLabel.attr('height') / 2;

            customLabel.attr({
              x,
              y,
            });
            customLabel.css({
              fontSize: `${series.center[2] / 12}px`,
            });
          },
        },
      },
      accessibility: {
        point: {
          valueSuffix: '%',
        },
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.0f}%</b>',
      },

      title: {
        text: '',
      },
      plotOptions: {
        series: {
          allowPointSelect: true,
          cursor: 'pointer',
          borderRadius: 0,
          dataLabels: [
            {
              enabled: true,
              distance: 20,
              format: '{point.name}',
            },
            {
              enabled: true,
              distance: -15,
              format: '{point.percentage:.0f}%',
              style: {
                fontSize: '0.9em',
              },
            },
          ],
          showInLegend: false,
        },
      },
      series: [
        {
          name: 'Participation',
          colorByPoint: true,
          innerSize: '75%',
          data: this.donut_data,
        },
      ],
    });
  }
}
