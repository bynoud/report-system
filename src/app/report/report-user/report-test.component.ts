
import { Component, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
    selector: 'app-report-test',
    template: `<p>testing: {{index}} -> {{test.a}} | {{test.b}}`
})
export class ReportTestComponent implements OnInit, OnDestroy {
    @Input() index: number;
    @Input() test: any;

    ngOnInit() {
        console.warn("init", this.index, this.test);
        
    }

    ngOnDestroy() {
        console.warn("destroy", this.index, this.test);
        
    }
}