export interface Version {

    _id:string;
    heading:string;
    images:Images[];
    createdAt:string;
    updatedAt:string;
    __v:number;

}


export interface Images{
    label:string;
    image:string;
    _id:string;
}