import { Plane } from './Plane';
import Wall from './Wall'
import { Obj } from './util'

enum State {
    NORAML = 0,
    COLLISION = 1
}

export class Shot extends Obj {
    private imgList : HTMLImageElement[] | null = null ;
    private state : State = 0 ;
    private currentIndex : number = 0 ;
    private normalImageIndex : number = 0 ;
    private collisionImageIndex : number = 0 ;
    private damage : number = 0 ;

    constructor(
        positionX : number, 
        positionY : number, 
        wall : Wall, 
        speed : number, 
        normalImageIndex : number,
        collisionImageIndex : number,
        direction : boolean, 
        imgList : HTMLImageElement[],
        damage : number
    ) {
        super( positionX, positionY, wall, speed ) ;

        this.normalImageIndex = normalImageIndex ;
        this.collisionImageIndex = collisionImageIndex ;

        this.imgList = imgList ;
        this.damage = damage ;

        // Todo : direction, userShot update
        if( direction ) {
            this.direction.right = true ; // User Plane Shot
        }else {
            this.direction.left = true ;  // Enemy Plane Shot
        }
    }

    public getCurrentIndex()                        { return this.currentIndex ; }
    public getNormalImageIndex()                    { return this.normalImageIndex ; }
    public getCollisionImageIndex()                 { return this.collisionImageIndex ; }
    public getState()                               { return this.state ; }
    public getImgList()                             { return this.imgList ; }
    public getDirection()                           { return this.direction ; }
    public getDamage()                              { return this.damage ; }

    public setCurrentIndex( currentIndex : number ) { 
        // Todo : Image List Index Vaildation
        if( currentIndex >= this.collisionImageIndex ) return ;

        this.currentIndex = currentIndex ; 
    }

    public setStateToCollison() { this.state = State.COLLISION ; }

    public move() {
        try {
            if( this.wall ) {
                if( this.direction.left ) {
                    if ( this.wall?.getLeft() < this.position.x - this.speed ) {
                        this.position.x -= this.speed ;
                    }else {
                        this.state = State.COLLISION ;
                    }
                }
                if( this.direction.right ) {
                    if ( this.wall?.getRight() > this.position.x + this.speed ) {
                        this.position.x += this.speed ;
                    }else {
                        this.state = State.COLLISION ;
                    }
                }
            }else {
                throw new Error("Not Found wall") ;
            }
        } catch (error) {
            
            console.log(error) ;

        }
    }
}

export class ShotList {
    private shotList : Shot[] = [] ;
    private instance : ShotList | null = null ;

    constructor() {}

    public getNormalShotState()    { return State.NORAML ; }
    public getCollisonShotState()  { return State.COLLISION ; }
    public getShots()              { return this.shotList ; }
    
    public getInstance() {
        if( this.instance ) return this.instance ;

        this.instance = this ;
        return this.instance ;
    }

    public createShot( 
        positionX : number, 
        positionY : number, 
        wall : Wall, 
        speed : number, 
        normalImageIndex : number,
        collisionImageIndex : number,
        direction : boolean, 
        imgList : HTMLImageElement[],
        damage : number
    ) {

        const shot = new Shot(
            positionX,
            positionY,
            wall,
            speed,
            normalImageIndex,
            collisionImageIndex,
            direction,
            imgList,
            damage
        ) ;
 
        this.shotList = this.shotList.concat(shot) ;
    }

    public shotToDamagePlane( user : boolean, ...plane : Plane[] ) {

        if( user ) { // UserPlane
            const shotList = this.shotList.filter(( shot : Shot ) => ( shot.getDirection().left === true )) ; // Enemy Shot

            shotList.forEach(( shot : Shot ) => {
                plane.forEach(( plane : Plane ) => {
                    if( plane.position.y < shot.position.y && plane.position.y + plane.getSize() > shot.position.y ) {
                        if( plane.position.x + plane.getSize() <= shot.position.x ) {
                            plane.setLife(plane.getLife() - shot.getDamage()) ;
                            console.log(plane.getLife()) ;
                            shot.setStateToCollison() ;
                        }
                    }
                }) ;
            }) ;

        }else {  // enemyPlane
            const shotList = this.shotList.filter(( shot : Shot ) => ( shot.getDirection().left === false )) ; // Enemy Shot

            shotList.forEach(( shot : Shot ) => {
                plane.forEach(( plane : Plane ) => {
                    if( plane.position.y < shot.position.y && plane.position.y + plane.getSize() > shot.position.y ) {
                        if( plane.position.x >= shot.position.x ) {
                            plane.setLife(plane.getLife() - shot.getDamage()) ;
                            console.log(plane.getLife()) ;
                            shot.setStateToCollison() ;
                        }
                    }
                }) ;
            }) ;
        }
    }

    public deleteShot() {
        const newShotList = this.shotList.filter(( Shot : Shot ) => Shot.getState() !== this.getCollisonShotState()) ;
        if( newShotList ) this.shotList = newShotList ;
    }

    public shotMove() {
        this.shotList.forEach((Shot : Shot) => {
            Shot.move() ;
            Shot.setCurrentIndex(Shot.getCurrentIndex() + 1) ;
        }) ;
    }
}