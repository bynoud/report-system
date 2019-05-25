import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { Task, Comment } from 'src/app/models/reports';
import { ReportService } from '../report.service';
import { BehaviorSubject } from 'rxjs';

const MAX_COMMENTS = 3; // paging 3 comments each

@Component({
    selector: 'app-report-comment-list',
    templateUrl: './report-comment-list.component.html',
})
export class ReportCommentListComponent implements OnInit, OnDestroy {
    @Input() task: Task;
    @Input() allowNew: boolean;
    @Input() showAll: boolean;

    latestComments: Comment[] = [];
    comments: Comment[] = [];
    nextCommentsFn: () => Promise<boolean>;
    commUnsubFn: () => void;
    isLastComment: boolean;

    model = {newComment: ""};
    loadingLatest$ = new BehaviorSubject<boolean>(true);
    loadingComment$ = new BehaviorSubject<boolean>(true);
    submitingComment$ = new BehaviorSubject<boolean>(false);

    constructor(
        private reportService: ReportService
    ) {}

    ngOnInit() {
        if (this.allowNew == null) this.allowNew = true;
        if (this.showAll == null) this.showAll = false;
        this.paginationComments();
    }
    
    ngOnDestroy() {
        if (this.commUnsubFn) this.commUnsubFn();
    }

    delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    async paginationComments() {
        [this.nextCommentsFn, this.commUnsubFn] = await this.reportService.getPaginationComments$(
            this.task, MAX_COMMENTS, this.latestComments, this.comments, 'Comment');
        this.loadingComment$.next(false);
        this.loadingLatest$.next(false);
        this.isLastComment = this.comments.length < MAX_COMMENTS;
    }
  
    getNextComments() {
        this.loadingComment$.next(true);
        this.nextCommentsFn().then(last => {
            this.isLastComment = last;
            this.loadingComment$.next(false);
        })
    }


    submitNewComment() {
        this.submitingComment$.next(true);
        this.reportService.addComment(this.task, this.model.newComment)
            .then(() => {
                this.model.newComment = "";
                this.submitingComment$.next(false)
            })
    }
    

}