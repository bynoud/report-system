import { Injectable, Inject, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';

// it's intended to be instanced, not inject
export class LoadingService {

  rootViewContainer: ViewContainerRef

  constructor(
    private factoryResolver: ComponentFactoryResolver,
  ) {
  }

  setRootViewContainerRef(viewContainerRef: ViewContainerRef) {
    this.rootViewContainer = viewContainerRef
  }


  addDynamicComponent() {
    const factory = this.factoryResolver
                        .resolveComponentFactory(LoadingComponent)
    const component = factory
      .create(this.rootViewContainer.parentInjector)
    this.rootViewContainer.insert(component.hostView)
  }

}
