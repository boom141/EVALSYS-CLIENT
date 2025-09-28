import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, ElementRef, inject } from '@angular/core';
import { dev_config } from '../environments/dev.env';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { evaluationCriteria } from '../shared/constant';
import { ViewChild } from '@angular/core';
@Component({
  selector: 'app-student',
  imports: [
    TableModule,
    ButtonModule,
    CommonModule,
    PaginatorModule,
    FormsModule,
    InputTextModule,
    CardModule,
  ],
  templateUrl: './student.component.html',
  styleUrl: './student.component.scss',
})
export class StudentComponent {
  public first: number = 0;
  public rows: number = 5;
  public total_records!: number;
  public filtered_data: any[] = [];
  public source_data!: any[];
  public selected_faculty: any = 1;
  public form_data: any = null;
  public filters: { [key: string]: string } = {};

  @ViewChild('textarea') feedback!: ElementRef<HTMLTextAreaElement>


  private _api = inject(HttpClient);  

  ngOnInit(): void {
    this.form_data = evaluationCriteria
    
  }

  ngAfterViewInit() {
    this.fetch_data();
  }
  get fetch_evaluation_questions() {
    return this.form_data;
  }

  fetch_data() {
    const params = new HttpParams().set(
      'student_id',
      '68d8f52a4475fd922013517c'
    );

    this._api
      .get(`${dev_config.api_base_url}/student`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        params,
      })
      .subscribe((res: any) => {
        this.source_data = res;
        this.total_records = this.source_data.length;
        this.filtered_data = [...this.source_data];
      });
  }

  modify_form_data(category_indx:number, question_indx:number, score:number){
     this.form_data[category_indx].questions[question_indx].score = score
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


  submit(){
    const questionaire:any = {}
    this.form_data.forEach((category:any, indx:number) => {
      questionaire[`category_${indx + 1}`] = category.questions.map((item:any) => ({
        score: item.score
      }))
    });

    const evaluation_data = {
      student_id: '68d8f52a4475fd922013517c',
      teacher_id: '68ca7b9e362b57b8d9d0a74f',
      questionaire,
      feedback: {
        message: this.feedback.nativeElement.value,
    }
    }

    this._api.post(`${dev_config.api_base_url}/evaluation`, evaluation_data ,{
            headers:{
        "ngrok-skip-browser-warning": "true"
      }
    }).subscribe((res: any) => {
      console.log(res)
    });
  }

}
