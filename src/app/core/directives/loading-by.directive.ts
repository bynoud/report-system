import { Directive, ElementRef, HostListener, Input, EventEmitter, OnInit, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { Subject, Subscription, BehaviorSubject } from 'rxjs';

@Directive({
  selector: '[appLoadingBy]'
})
export class LoadingByDirective implements OnInit {

  @Input('appLoadingBy') loadingChanged$: BehaviorSubject<boolean>;
  nativeEle: any;
  loadingEle: any;
  tagName: string;
  savedStates = {};

  subs: Subscription;

  constructor(
    private element: ElementRef,
    private vcRef: ViewContainerRef,
    private factoryResolve: ComponentFactoryResolver,
  ) {
    this.nativeEle = this.element.nativeElement;
    this.tagName = this.nativeEle.tagName.toLowerCase();
  }

  ngOnInit() {
    this.loadingEle = this.createLoadingElement()

    // const factory = this.factoryResolve.resolveComponentFactory(LoadingWrapComponent);
    // const component = factory.create(this.vcRef.injector);
    // // this.componentRef = this.vcRef.createComponent(factory, null, this.vcRef.injector);
    // this.vcRef.createEmbeddedView(component.instance.templ)
    // console.log(component.instance.templ);

    this.subs = this.loadingChanged$.subscribe(val => {
      console.log("loading", val);
      
      if (val) this.showLoading();
      else this.hideLoading();
    })

  }

  createLoadingElement() {
    this.nativeEle.style.position = 'relative';
    
    const loadingEle = document.createElement("div");
    loadingEle.style.display = "none";
    loadingEle.className = "loading-container";


    const spinDiv = document.createElement("div");
    spinDiv.className = "spinning-square";
    const size = Math.min(this.nativeEle.offsetWidth, this.nativeEle.offsetHeight);
    spinDiv.style.width = `${size}px`;
    spinDiv.style.height = `${size}px`;

    const spinning = document.createElement("div");
    spinning.className = "spinning-loader";
    // spinning.style.width = `${size}px`;
    // spinning.style.height = `${size}px`;
    
    spinDiv.appendChild(spinning);
    loadingEle.appendChild(spinDiv);
    this.nativeEle.appendChild(loadingEle);

    return loadingEle;
  }

  showLoading() {
    this.loadingEle.style.display = "flex";
    if (this.tagName == "button") {
      this.savedStates['disabled'] = this.nativeEle.disabled;
      this.nativeEle.disabled = true;
    }
  }

  hideLoading() {
    this.loadingEle.style.display = "none";
    if (this.tagName == "button") {
      this.nativeEle.disabled = this.savedStates['disabled'];
    }

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
