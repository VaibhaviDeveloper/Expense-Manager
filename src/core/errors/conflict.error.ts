export class ConflictError extends Error{
    constructor(message:string,conflictError:string){
       super(message);
       this.name=ConflictError;
      this.conflictError = conflictError;
   }
    
}