import { Component } from '@angular/core';

@Component({
  selector: 'app-not-authorized',
  template: `
    <div style="text-align:center; margin-top: 50px;">
      <h2>Not Authorized</h2>
      <p>You do not have permission to view this page.</p>
    </div>
  `
})
export class NotAuthorizedComponent {} 