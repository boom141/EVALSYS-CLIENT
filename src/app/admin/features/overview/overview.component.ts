import { Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { chart } from 'highcharts';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-overview',
  imports: [CardModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  public barchart_data: any;
  public donut_data: any;
  public infocards_data: any;
  public postive_sentiments_data: any
  public neutral_sentiments_data: any
  public negative_sentiments_data: any

  private _api = inject(HttpClient)

  ngOnInit(): void {
    this.fetch_data()
  }
  
  ngAfterViewInit(): void {
    this.render_bar_chart();
    this.render_participation_score();
  }

  fetch_data(){
    this._api.get('http://127.0.0.1:8089/overview').subscribe((res:any)=>{
      this.infocards_data = res.info_cards
      this.barchart_data = res.sentiment_data
      this.donut_data = res.participation_score
      this.postive_sentiments_data = res.sentiment_data.positive.feedbacks
      this.neutral_sentiments_data = res.sentiment_data.neutral.feedbacks
      this.negative_sentiments_data = res.sentiment_data.negative.feedbacks
    })
  }


  render_bar_chart() {
    (this.barchart_data = [
      {
        name: 'sentiment',
        data: [
          { y: this.barchart_data.positive.count, color: '#43900C' },
          { y: this.barchart_data.neutral.count, color: '#CECECE' },
          { y: this.barchart_data.negative.count, color: '#D21313' },
        ],
      },
    ]),
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
}
