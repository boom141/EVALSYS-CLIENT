import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Auth_Service } from '../../../core/services/auth.service';
import { dev_config } from '../../../environments/dev.env';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-forms',
  imports: [
    TableModule,
    ButtonModule,
    CommonModule,
    PaginatorModule,
    FormsModule,
    InputTextModule,
    CardModule,
    DialogModule,
    TooltipModule,
    InputTextModule,
  ],
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.scss',
})
export class FormsComponent {
  public first: number = 0;
  public rows: number = 5;
  public total_records!: number;
  public filtered_data: any[] = [];
  public source_data!: any[];
  public selected_form: any = null;
  public temp_selected_form: any = null;
  public form_data: any = null;
  public teacher_name!: string;
  public filters: { [key: string]: string } = {};
  public selected_sem!: string;
  public selected_sy!: string;
  public selected_sem_form!: string;
  public selected_sy_form!: string;
  public current_status!: string;
  public new_form_data: any[] = [];

  public goback_dialog_visibility: boolean = false;
  public submit_dialog_visibility: boolean = false;
  public delete_dialog_visibility: boolean = false;
  public edit_dialog_visibility: boolean = false;
  public create_dialog_visibility: boolean = false;
  public edit_button_Active: boolean = false

  private _api = inject(HttpClient);
  private _toast_service = inject(ToastService);
  private _loadingService = inject(LoadingService);
  private _auth_service = inject(Auth_Service);


  @ViewChild('sy_form') sy_form!: ElementRef<HTMLSelectElement>
  @ViewChild('sem_form') sem_form!: ElementRef<HTMLSelectElement>

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.fetch_data();
  }

  handle_goback_dialog() {
    this.goback_dialog_visibility = false;
    // this.back_to_faculty();
  }

  handle_submit_dialog() {
    this.submit_dialog_visibility = false;
    // this.submit()
  }

  handle_delete_dialog() {
    this._loadingService.show();
    this._api
      .delete(
        `${dev_config.api_base_url}/forms/${this.temp_selected_form._id}`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        }
      )
      .subscribe(
        (res: any) => {
          this._loadingService.hide();
          this._toast_service.show({
            severity: 'success',
            summary: 'Forms',
            detail: 'Data Deleted Successfully',
          });
          this.delete_dialog_visibility = false;
          this.fetch_data();
        },
        (err) => {
          this._loadingService.hide();
          this._toast_service.show({
            severity: 'error',
            summary: 'Forms',
            detail: 'Data Deleted Unsuccessfully',
          });
          this.delete_dialog_visibility = false;
          this.fetch_data();
        }
      );
  }

  update_form() {
    this._loadingService.show();
    if(!this.edit_button_Active){
      this.temp_selected_form.status = this.temp_selected_form.status === 'Inactive' ? 'Active' : 'Inactive'
    }
    const form_id = this.temp_selected_form._id
    delete this.temp_selected_form._id
    this._api
      .put(
        `${dev_config.api_base_url}/forms/${form_id}`,
        {
          update_data: this.temp_selected_form
        },
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        }
      )
      .subscribe(
        (res: any) => {
          this._loadingService.hide();
          this._toast_service.show({
            severity: 'success',
            summary: 'Forms',
            detail: 'Data Updated Successfully',
          });
          this.edit_dialog_visibility = false;
          this.create_dialog_visibility = false
          this.fetch_data();
        },
        (err) => {
          this._loadingService.hide();
          this._toast_service.show({
            severity: 'error',
            summary: 'Forms',
            detail: 'Data Updated Unsuccessfully',
          });
          this.edit_dialog_visibility = false;
          this.create_dialog_visibility = false
          this.fetch_data();
        }
      );
      
      this.edit_button_Active = false
      this.new_form_data = []
  }

  handle_edit_dialog() {
    this.temp_selected_form.semester = Number(this.selected_sem_form)  
    this.temp_selected_form.school_year = this.selected_sy_form 
    this.temp_selected_form.data = this.new_form_data
    this.update_form()
  }

  select_delete_form(row_data: any) {
    this.delete_dialog_visibility = true;
    this.temp_selected_form = row_data;
  }

  init_edit_form(){
    this.edit_button_Active = true
    this.new_form_data = this.temp_selected_form.data
    this.selected_sem_form = this.temp_selected_form.semester
    this.selected_sy_form = this.temp_selected_form.school_year
    this.edit_dialog_visibility = false

    this._loadingService.show()
    setTimeout(()=>{
      this._loadingService.hide()
      this.create_dialog_visibility = true
    },500)
  }

  select_edit_form(row_data: any) {
    this.edit_dialog_visibility = true;
    this.temp_selected_form = row_data;
    this.current_status = this.temp_selected_form.status;
  }
  on_select_sem(event: Event) {
    this.selected_sem = (event.target as HTMLSelectElement).value;
    this.fetch_data();
  }

  on_select_sy(event: Event) {
    this.selected_sy = (event.target as HTMLSelectElement).value;
    this.fetch_data();
  }

  on_select_sem_form(event: Event) {
    this.selected_sem_form = (event.target as HTMLSelectElement).value;
  }

  on_select_sy_form(event: Event) {
    this.selected_sy_form = (event.target as HTMLSelectElement).value;
  }

  fetch_data() {
    this._loadingService.show();

    const params_obj: any = {};
    if (this.selected_sy) params_obj.school_year = this.selected_sy;
    if (this.selected_sem) params_obj.semester = this.selected_sem;

    this._api
      .get(`${dev_config.api_base_url}/forms`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        params: new HttpParams({ fromObject: params_obj }),
      })
      .subscribe(
        (res: any) => {
          this.source_data = res;
          this.total_records = this.source_data.length;
          this.filtered_data = [...this.source_data];
          this._loadingService.hide();
          this._toast_service.show({
            severity: 'success',
            summary: 'Forms',
            detail: 'Data Loaded Successfully',
          });
        },
        (err) => {
          this._loadingService.hide();
          this._toast_service.show({
            severity: 'error',
            summary: 'Forms',
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
    this.selected_form = row_data;
    this.teacher_name = row_data.name;
  }

  back_to_faculty() {
    this.selected_form = null;
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

  add_category() {
    this.new_form_data.push({
      category: '',
      questions: [],
    });
  }

  add_category_question(indx: number) {
    this.new_form_data[indx].questions.push({
      text: '',
      score: null,
    });
  }

  create_new_form() {
    this._loadingService.show();

    const post_data = {
      school_year: this.selected_sy_form,
      semester: Number(this.selected_sem_form),
      status: 'Inactive',
      data: this.new_form_data,
    };

    this._api
      .post(`${dev_config.api_base_url}/forms`, post_data, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      })
      .subscribe(
        (res: any) => {
          this.create_dialog_visibility = false;
          this._loadingService.hide();
          this._toast_service.show({
            severity: 'success',
            summary: 'Forms',
            detail: 'Data Added Successfully',
          });
          this.fetch_data()
        },
        (err) => {
          this.create_dialog_visibility = false;
          this._loadingService.hide();
          this._toast_service.show({
            severity: 'error',
            summary: 'Forms',
            detail: 'Data Added Unsuccessfully',
          });
        }
      );
      this.new_form_data = []
  }

  set_form(){
    this.sy_form.nativeElement.value = this.selected_sem_form
    this.sem_form.nativeElement.value = this.selected_sy_form
  }
  reset_form(){
    this.sy_form.nativeElement.value = ''
    this.sem_form.nativeElement.value = ''
    this.new_form_data = []
  }
}
