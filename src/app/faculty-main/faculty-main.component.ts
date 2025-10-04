import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, ElementRef, inject } from '@angular/core';
import { evaluationCriteria } from '../shared/constant';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { dev_config } from '../environments/dev.env';
import { chart } from 'highcharts';
import { Navigation_Service } from '../core/services/navigation.service';
import { Auth_Service } from '../core/services/auth.service';

@Component({
  selector: 'app-faculty-main',
  imports: [
    TableModule,
    ButtonModule,
    CommonModule,
    PaginatorModule,
    FormsModule,
    InputTextModule,
    CardModule,
  ],
  templateUrl: './faculty-main.component.html',
  styleUrl: './faculty-main.component.scss',
})
export class FacultyMainComponent {
  public first: number = 0;
  public rows: number = 5;
  public total_records!: number;
  public filtered_data: any[] = [];
  public source_data!: any[];
  public selected_form: any = null;
  public filters: { [key: string]: string } = {};

  public barchart_data: any;
  public donut_data: any;
  public infocards_data: any;
  public postive_sentiments_data: any;
  public neutral_sentiments_data: any;
  public negative_sentiments_data: any;

  private _api = inject(HttpClient);
  private _navigation = inject(Navigation_Service)
  private _auth_service = inject(Auth_Service)

  ngOnInit(): void {
    this.fetch_data()
  }
  
  fetch_data() {
    const params = new HttpParams().set(
      'id',
      '68ca7b9e362b57b8d9d0a74f'
    );
    this._api
      .get(`${dev_config.api_base_url}/overview`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        params
      })
      .subscribe((res: any) => {
        this.source_data = evaluationCriteria.map(item =>({ ...item, evaluation_data: res }))
        this.filtered_data = [...this.source_data];
      });
  }


  select_forms(row_data: any) {
    this.selected_form = row_data.evaluation_data;
    this.infocards_data = this.selected_form.info_cards;
    this.barchart_data = this.selected_form.sentiment_data;
    this.donut_data = this.selected_form.participation_score;
    this.postive_sentiments_data =
      this.selected_form.sentiment_data.positive.feedbacks;
    this.neutral_sentiments_data =
      this.selected_form.sentiment_data.neutral.feedbacks;
    this.negative_sentiments_data =
      this.selected_form.sentiment_data.negative.feedbacks;


    setTimeout(() => {
      this.render_bar_chart();
      this.render_participation_score();
    }, 100);
  }

  back_to_faculty(){
    this.selected_form = null
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
    ]
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
                .label('Total<br/>' + `<strong>100%</strong>`)
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

    handle_signout(){
      this._auth_service.sign_out()
      this._navigation.navigate_to_link()
    }
}
