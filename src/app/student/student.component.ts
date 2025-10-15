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
import { Navigation_Service } from '../core/services/navigation.service';
import { Auth_Service } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';
import { LoadingService } from '../core/services/loading.service';
import { DialogModule } from 'primeng/dialog';
import { Message } from 'primeng/message';
import { find } from 'highcharts';
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
    DialogModule,
    Message,
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
  public selected_faculty: any = null;
  public form_data: any = null;
  public teacher_name!: string;
  public filters: { [key: string]: string } = {};

  public goback_dialog_visibility: boolean = false;
  public submit_dialog_visibility: boolean = false;
  public form_validation_dialog: boolean = false

  @ViewChild('textarea') feedback!: ElementRef<HTMLTextAreaElement>;

  private _api = inject(HttpClient);
  private _navigation = inject(Navigation_Service);
  private _auth_service = inject(Auth_Service);
  private _toast_service = inject(ToastService);
  private _loadingService = inject(LoadingService);
  private forms!: any

  ngOnInit(): void {
    this._auth_service.set_forms()
    this.form_data = evaluationCriteria[0].data;
  }

  ngAfterViewInit() {
    this.forms = this._auth_service.get_forms()
    this.fetch_data();
  }
  get fetch_evaluation_questions() {
    return this.form_data;
  }

  get current_user(){
    return this._auth_service.getUser()
  }

  handle_goback_dialog() {
    this.goback_dialog_visibility = false;
    this.back_to_faculty();
  }

  handle_submit_dialog() {
    this.submit_dialog_visibility = false;
    this.submit()
  }

  fetch_data() {
    const params = new HttpParams().set(
      'student_id',
      this._auth_service.getUser()._id
    );
    this._loadingService.show();
    this._api
      .get(`${dev_config.api_base_url}/student`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        params,
      })
      .subscribe(
        (res: any) => {
          this.source_data = res;
          this.total_records = this.source_data.length;
          this.filtered_data = [...this.source_data];
          this._loadingService.hide();
          this._toast_service.show({
            severity: 'success',
            summary: 'Student Evaluation Hub',
            detail: 'Data Loaded Successfully',
          });
        },
        (err) => {
          this._loadingService.hide();
          this._toast_service.show({
            severity: 'Error',
            summary: 'Student Evaluation Hub',
            detail: 'Data Loaded Unsuccessfully',
          });
        }
      );
  }

  modify_form_data(
    category_indx: number,
    question_indx: number,
    score: number
  ) {
    this.form_data[category_indx].questions[question_indx].score = score;
  }

  select_faculty(row_data: any) {
    this.selected_faculty = row_data;
    this.teacher_name = row_data.name;
  }

  back_to_faculty() {
    this.selected_faculty = null;
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

  findFirstNullScoreIndex() {
  for (let parentIndex = 0; parentIndex < this.form_data.length; parentIndex++) {
    const questions = this.form_data[parentIndex].questions;
    for (let childIndex = 0; childIndex < questions.length; childIndex++) {
      if (questions[childIndex].score === null) {
        return { parentIndex, childIndex };
      }
    }
  }

  return null;
}


  submit() {

    if(this.findFirstNullScoreIndex() === null){
      const questionnaire: any = {};
      this.form_data.forEach((category: any, indx: number) => {
        questionnaire[`category_${indx + 1}`] = category.questions.map(
          (item: any) => ({
            score: item.score,
          })
        );
      });
  
      const evaluation_data = {
        student_id: this._auth_service.getUser()._id,
        teacher_id: this.selected_faculty._id,
        questionnaire,
        feedback: {
          message: this.feedback.nativeElement.value,
        },
      };
      this._loadingService.show();
      this._api
        .post(`${dev_config.api_base_url}/evaluation`, evaluation_data, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        })
        .subscribe(
          (res: any) => {
            this._loadingService.hide();
            this._toast_service.show({
              severity: 'success',
              summary: 'Student Evaluation Hub',
              detail: 'Form Submitted Successfully',
            });
            this._auth_service.update_forms(this.selected_faculty._id)
            this.back_to_faculty()
          },
          (err) => {
            this._loadingService.hide();
            this._toast_service.show({
              severity: 'Error',
              summary: 'Student Evaluation Hub',
              detail: 'Form Submitted Unsuccessfully',
            });
          }
        );
    }else{
      this.form_validation_dialog = true
    }
    
  }


  handle_signout() {
    this._auth_service.sign_out();
    this._navigation.navigate_to_link();
  }

  is_complete(id:string){
    if(this._auth_service.get_forms()){
      return id in this._auth_service.get_forms()
    }else{
      return false
    }
  }
}
