import { Component, OnInit, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

@Component({
  selector: 'app-loading-base',
  templateUrl: './loading-base.component.html',
  styleUrls: ['./loading-base.component.css']
})
export class LoadingBaseComponent {

  constructor(
    private factoryResolver: ComponentFactoryResolver,
    private rootViewContainer: ViewContainerRef
  ) { }

  addDynamicComponent() {
    const factory = this.factoryResolver
                        .resolveComponentFactory(LoadingBaseComponent)
    const component = factory
      .create(this.rootViewContainer.parentInjector)
    this.rootViewContainer.insert(component.hostView)
  }

}
