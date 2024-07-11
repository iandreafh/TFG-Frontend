import { Component } from '@angular/core';
import { ApiGenericService} from '../../services/api-generic.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {

  constructor(private apiGenericService: ApiGenericService) { }

  ngOnInit(): void {}

}
