import { Component, input, output } from '@angular/core';
import { EmailTemplate, EmailTemplateId } from '../../../../core/models/tenant.model';

@Component({
  selector: 'app-smtp-preview',
  imports: [],
  templateUrl: './smtp-preview.html',
  styleUrl: './smtp-preview.scss',
})
export class SmtpPreview {
  readonly templates = input.required<EmailTemplate[]>();
  readonly activeTemplate = input.required<EmailTemplateId>();
  readonly senderEmail = input.required<string>();
  readonly changed = output<EmailTemplateId>();

  protected switchTemplate(id: EmailTemplateId): void {
    this.changed.emit(id);
  }

  protected currentTemplate(): EmailTemplate | undefined {
    return this.templates().find(t => t.id === this.activeTemplate());
  }
}