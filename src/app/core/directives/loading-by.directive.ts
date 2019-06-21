import { Directive, ElementRef, Input, OnInit, ViewContainerRef, ComponentFactoryResolver, ComponentRef, Component, ApplicationRef, ViewChild, Injector } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';
import { DomPortalHost, PortalHost, TemplatePortal } from '@angular/cdk/portal';


@Component({
  selector: 'app-loading-by-content',
  template: `
  <ng-template #loadingContainer>
  <div class="loading-container">
    <!-- <div class="spinning-square" [style.width.px]="context.size" [style.height.px]="context.size">
      <div class="spinning-loader"></div>
    </div> -->
    <img src='assets/Loading-Eclipse-1.2s-200px.svg' [ngStyle]="{'max-width': '80%', 'max-height': '80%'}">
    <p *ngIf="text">{{text}}</p>
  </div>
  </ng-template>
`,
styles: [`
.loading-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0; 
  left: 0;
  background-color: rgba(0,0,0,0.02);
  z-index: 10; /* Specify a stack order in case you're using a different order for other elements */
  cursor: wait;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}`]
})
export class LoadingByContentComponent {
  private portalHost: PortalHost;
  private portal;
  @ViewChild('loadingContainer') loadingContainerTmpl;

  @Input() outletEle: any;
  @Input() context: {text: string, hide: boolean};
  @Input() display: string;
  @Input() text: string;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef,
    private viewContainerRef: ViewContainerRef
  ){}

}

@Directive({
  selector: '[appLoadingBy]',
})
export class LoadingByDirective implements OnInit {

  @Input('appLoadingBy') loadingChanged$: BehaviorSubject<boolean>;
  @Input() loadingText: string;

  savedStates = {};
  loadingCtx: {text: string, hide: boolean};
  subs: Subscription;

  constructor(
    private element: ElementRef,
    private vcRef: ViewContainerRef,
    private factoryResolve: ComponentFactoryResolver,
    private appRef: ApplicationRef
  ) {}

  ngOnInit() {
    const comp = this.createLoadingElement();
    this.subs = this.loadingChanged$.subscribe(val => {
      if (val) comp.style.display = 'flex';
      else comp.style.display = 'none';

    })

  }

  createLoadingElement() {
    const outletEle = this.element.nativeElement;
    outletEle.style.position = 'relative';
    const factory = this.factoryResolve.resolveComponentFactory(LoadingByContentComponent);
    const component = this.vcRef.createComponent(factory, null, this.vcRef.injector);
    const templ = this.vcRef.createEmbeddedView(component.instance.loadingContainerTmpl, {text: "TBD"});
    const loadingEle = templ.rootNodes[0];
    outletEle.appendChild(loadingEle);
    return loadingEle;
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
