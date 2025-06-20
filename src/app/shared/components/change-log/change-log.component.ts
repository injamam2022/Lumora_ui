import { Component, Input } from '@angular/core';
import { ChangeLog } from '../../interface/change-log.interface';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-change-log',
  standalone: true,
  imports: [TableModule],
  templateUrl: './change-log.component.html',
  styleUrl: './change-log.component.scss',
})
export class ChangeLogComponent {
  @Input() public changeLogData!: ChangeLog;

  ngOnInit() {
    console.log(this.changeLogData);
  }
}
