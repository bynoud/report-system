import { Directive, ElementRef, Input, OnInit, ViewContainerRef, ComponentFactoryResolver, ComponentRef, Component, ApplicationRef, ViewChild, Injector } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';
import { DomPortalHost, PortalHost, TemplatePortal } from '@angular/cdk/portal';
import { LoadingComponent } from '../loading/loading.component';


@Component({
  selector: 'app-loading-by-content',
  template: `
  <ng-template #loadingContainer>
  <div class="loading-container"  [style.display]="context.hide ? 'none' : 'flex'">
    <div class="spinning-square" [style.width.px]="context.size" [style.height.px]="context.size">
      <div class="spinning-loader"></div>
    </div>
  </div>
  </ng-template>
`,
styles: [`
.loading-container {
  position: absolute;
  background-color: rgba(0,0,0,0.1);
`]
})
export class LoadingByContentComponent {
  private portalHost: PortalHost;
  private portal;
  @ViewChild('loadingContainer') loadingContainerTmpl;

  @Input() outletEle: any;
  @Input() context: {size: number, hide: boolean};

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef,
    private viewContainerRef: ViewContainerRef
  ){}

  ngOnInit() {    
    // Create a portalHost from a DOM element
    this.portalHost = new DomPortalHost(this.outletEle,
      this.componentFactoryResolver,
      this.appRef,
      this.injector
    )

    // Locate the component factory for the HeaderComponent
    this.portal = new TemplatePortal(
      this.loadingContainerTmpl,
      this.viewContainerRef,
    );

    // Attach portal to host
    this.portalHost.attach(this.portal);
  }

  ngOnDestroy(): void {
    this.portalHost.detach();
  }
}

@Directive({
  selector: '[appLoadingBy]',
})
export class LoadingByDirective implements OnInit {

  @Input('appLoadingBy') loadingChanged$: BehaviorSubject<boolean>;
  savedStates = {};
  loadingCtx: {size: number, hide: boolean};
  subs: Subscription;

  constructor(
    private element: ElementRef,
    private vcRef: ViewContainerRef,
    private factoryResolve: ComponentFactoryResolver,
    private appRef: ApplicationRef
  ) {}

  ngOnInit() {
    // this.loadingEle = this.createLoadingElement()

    this.createLoadingElement();
    this.subs = this.loadingChanged$.subscribe(val => {
      console.log("loading change", val, this.element.nativeElement);
      
      if (val) this.loadingCtx.hide = false;
      else this.loadingCtx.hide = true;
    })

  }

  createLoadingElement() {
    const outletEle = this.element.nativeElement;
    const factory = this.factoryResolve.resolveComponentFactory(LoadingByContentComponent);
    // const component = factory.create(this.vcRef.injector);
    const component = this.vcRef.createComponent(factory, null, this.vcRef.injector);
    const size = Math.min(outletEle.offsetWidth, outletEle.offsetHeight);
    this.loadingCtx = {size: size, hide: false}
    component.instance.context = this.loadingCtx;
    component.instance.outletEle = outletEle;
    return component;
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}



// class LoadingByDirective_old implements OnInit {

//   @Input('appLoadingBy') loadingChanged$: BehaviorSubject<boolean>;
//   nativeEle: any;
//   loadingEle: any;
//   loadingRef: ComponentRef<LoadingComponent>;
//   tagName: string;
//   hide = false;
//   savedStates = {};

//   subs: Subscription;

//   constructor(
//     private element: ElementRef,
//     private vcRef: ViewContainerRef,
//     private factoryResolve: ComponentFactoryResolver,
//   ) {
//     this.nativeEle = this.element.nativeElement;
//     this.tagName = this.nativeEle.tagName.toLowerCase();
//   }

//   ngOnInit() {
//     // this.loadingEle = this.createLoadingElement()

//     this.loadingRef = this.createLoadingElement();
//     this.subs = this.loadingChanged$.subscribe(val => {
//       console.log("loading", val);
//       if (val) this.showLoading();
//       else this.hideLoading();
//     })

//   }

//   createLoadingElement() {
//     const factory = this.factoryResolve.resolveComponentFactory(LoadingComponent);
//     // const component = factory.create(this.vcRef.injector);
//     const component = this.vcRef.createComponent(factory, null, this.vcRef.parentInjector);
//     component.hostView.detectChanges();
//     const size = Math.min(this.nativeEle.offsetWidth, this.nativeEle.offsetHeight);
//     component.instance.height = size;
//     component.instance.width = size;
//     // move the component element to child of host-element
//     this.nativeEle.appendChild(component.location.nativeElement);
//     return component;
//   }

//   createLoadingElement_byDOM() {
//     this.nativeEle.style.position = 'relative';
    
//     const loadingEle = document.createElement("div");
//     loadingEle.style.display = "none";
//     loadingEle.className = "loading-container";


//     const spinDiv = document.createElement("div");
//     spinDiv.className = "spinning-square";
//     const size = Math.min(this.nativeEle.offsetWidth, this.nativeEle.offsetHeight);
//     spinDiv.style.width = `${size}px`;
//     spinDiv.style.height = `${size}px`;

//     const spinning = document.createElement("div");
//     spinning.className = "spinning-loader";
//     // spinning.style.width = `${size}px`;
//     // spinning.style.height = `${size}px`;
    
//     spinDiv.appendChild(spinning);
//     loadingEle.appendChild(spinDiv);
//     this.nativeEle.appendChild(loadingEle);

//     return loadingEle;
//   }

//   showLoading() {
//     // this.loadingEle.style.display = "flex";
//     // this.loadingRef.instance.show();
//     this.hide = false;
//     if (this.tagName == "button") {
//       this.savedStates['disabled'] = this.nativeEle.disabled;
//       this.nativeEle.disabled = true;
//     }
//   }

//   hideLoading() {
//     // this.loadingEle.style.display = "none";
//     // this.loadingRef.instance.hide();
//     this.hide = true;
//     if (this.tagName == "button") {
//       this.nativeEle.disabled = this.savedStates['disabled'];
//     }

//   }

//   ngOnDestroy() {
//     this.subs.unsubscribe();
//   }

// }
