/// <reference path="stateful.ts" />
/// <reference path="shape.ts" />
/// <reference path="gamestate.ts" />


interface BulletState {
   owner: ex.Actor;
   x: number;
   y: number;
   d: ex.Vector;
   speed: number;
   damage: number;
   scale: number;
   shape?: Shape;
}

class Bullet extends ex.Actor implements Stateful<BulletState>, Poolable {
   
   poolId: number;
   public owner: ex.Actor = null;
   constructor() {
      super(0, 0, 3, 3, ex.Color.Red);
      this.collisionType = ex.CollisionType.Passive;
      this.reset();
      this.rx = Config.bullets.rotation;

      this.on('exitviewport', () => this.kill());// GameState.state.bullets.despawn(this));
      this.on('collision', this._collision);
      this.on('postdraw', this.postdraw);
   }
   
   state: BulletState;
   _collision(collision: ex.CollisionEvent) {
      if(this.visible){
         if(this.owner.constructor !== collision.other.constructor && this.constructor !== collision.other.constructor) {
           if(collision.other instanceof Ship){
             var player = <Ship>collision.other;
             if(player.state.shieldType === this.state.shape){
                 switch(this.state.shape){
                     case(Shape.Shape1):
                        player.state.squarePool += 1;                         
                        break; 
                     
                     case(Shape.Shape2):
                        player.state.circlePool += 1;
                        break; 
                     
                     case(Shape.Shape3):
                        player.state.trianglePool += 1;
                         break;
                
                 }
                 
                 this.kill();
                 return;
             }  
           }
            if(!(collision.other instanceof Ship)){
                var currKills = parseInt(GameState.getGameStat("KILLS").toString()) + 1;
                GameState.setGameStat("KILLS", currKills);
            } else {
                GameState.state.ship.dx = 0;
                GameState.state.ship.dy = 0;
            }
            if (collision.other instanceof Badguy){
                    var badguy: Badguy;
                    badguy = <Badguy>collision.other;
                    badguy.explode();
                    badguy.delay(150).die();
                }else{
                 collision.other.kill();                   
                }
                Resources.Explode.play();
                this.kill();
         }
      }
   }
   onInitialize(engine: ex.Engine){
       
   }
   reset(state?: BulletState) {
      
      if (!state) {
         
         this.visible = false;
         // defaults
         this.state = {
            owner: null,
            x: 0,
            y: 0,
            scale: .5,
            d: new ex.Vector(0, 0),
            damage: Config.bullets.damage,
            speed: Config.bullets.speed,
            shape: Shape.Shape1
         }
      } else {
         this.visible = true;
         this.state = state;
         this.x = state.x;
         this.y = state.y;
         this.scale = new ex.Vector(state.scale, state.scale);
         this.owner = state.owner;
         var normalized = this.state.d.normalize();
         this.dx = normalized.x * this.state.speed;
         this.dy = normalized.y * this.state.speed;
      }
      
      return this;
   }
   
   postdraw(evt: ex.PostDrawEvent){
      if(this.state.shape === Shape.Shape1){
         GlobalAnimations.SquareBullet.draw(evt.ctx, 0, 0);
      }            
      if(this.state.shape === Shape.Shape2){
         GlobalAnimations.CircleBullet.draw(evt.ctx, 0, 0);
      }
      if(this.state.shape === Shape.Shape3){
         GlobalAnimations.TriangleBullet.draw(evt.ctx, 0, 0);
      }
     if(this.state.shape === Shape.PlayerBullet){
         GlobalAnimations.PlayerBullet.draw(evt.ctx, 0, 0);
      }
   }
   
}