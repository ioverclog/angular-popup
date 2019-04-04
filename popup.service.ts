
@Injectable()
export class PopupService {

stack: number | null = 0;

constructor(private cfr: ng.ComponentFactoryResolver) {
}

show(type:any, providers?:Arrat<ng.Type<any> | ng.Provider | any[] | any>): Observable<any> {
    const o: Observable<any> = new Observable<any>((sub: Subscriber<any>) => {
        if(!providers) {
            providers = [];
        }

        let pc = new PopupCtrl(sub);
        providers.push({provide: PopupCtrl, useValue: pc});

        let resolvedInputs = ng.ReflectiveInjector.resolve(providers);
        let injector = ng.ReflectiveInjector.fromResolvedProviders(resolvedInputs, PopupPlaceholderComponent.vcr.injector);

        let factory = this.cfr.resolveComponentFactory(type);
        let ref = factory.create(injector);
        PopupPlaceholderComponent.vcr.insert(ref.hostView);
       
        let popup: any = $(ref.location.nativeElement.childNode[0]);
        let popupModal: any = popup.modal();

        let destroyed = false;
        let destory = () =>{
            if (!destroyed) {
                destroyed = true;
                popupModal.modal("hide").data("bs.modal", null);

                this.stack--;

                if(this.stack !== 0) {
                    if($(".modal").hasClass("in")) {
                         $("body").addClass("modal-open");
                         popupModal.on("hidden.bs.modal", ()=>{
                             $("body").addClass("modal-open");
                         });
                    }
                }
                ref.destroy();
                //Call observer's complete function.
                sub.complete();
            }
        }

        o.subscribe(destroy, destroy, destroy);

        popupModal.on("hidden.bs.modal", ()=>{
            destroy();
        })
    }).share().publishReplay(1).refCount();
    
    return o;
}

@ng.Directive({
    selector: "[popup-placeholder]"
})
export class PopupPlaceholderComponent {
    static vcr: ng.ViewContainerRef;
    constructor(private vcr: ng.ViewContainerRef) {
        PopupPlaceholderComponent.vcr = vcr;
    }
}

export class PopupCtrl {
    constructor(private sub: Subscripber<any>) {
    }
    
    discard(): void {
        this.sub.complete();
    }
    close(val: any): void {
        this.sub.next(val);
        this.sub.complete();
    }
    cancel(val: any): void {
        this.sub.next(val);
        this.sub.complete();
    }
    error(val: any) {
        this.sub.error(val);
    }
}
