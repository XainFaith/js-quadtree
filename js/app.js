class TestBedApp
{

    static app;
    static testObject;

    testObjects;
    static tree;

    constructor(app)
    {
        TestBedApp.app = app;

        TestBedApp.app.ticker.add(this.update);

        TestBedApp.tree = new QuadTree(1024,800,100,100);
        TestBedApp.app.stage.addChild(TestBedApp.tree);

        
        for(let i = 0; i < 100; i++)
        {
            let randWidth = getRandomArbitrary(25,125);
            let randHeight = getRandomArbitrary(25,125);

            let randX = getRandomArbitrary(10, app.screen.width - randWidth);
            let randY = getRandomArbitrary(10, app.screen.height - randHeight);

            let newGfxObject = new TestObject(randX, randY, randWidth, randHeight, 0x00bbbb);
            TestBedApp.tree.insert(newGfxObject.bounds, newGfxObject);

        }
        TestBedApp.testObjects = new Array();
        for(let j = 0; j < 10; j++)
        {
            TestBedApp.testObjects.push(new TestObject(0,0,50,50,0xF0F000));
        }
    }

    static debug = false;

    update(delta)
    {
        delta = TestBedApp.app.ticker.elapsedMS;
        
        if(TestBedApp.debug == false)
        {
            for(let i in TestBedApp.testObjects)
            {

                let collisions = TestBedApp.tree.query(TestBedApp.testObjects[i].bounds);
                
                if(collisions.length != 0)
                {
                    TestBedApp.testObjects[i].colliding = true;
                    
                    
                }
                else
                {
                    TestBedApp.testObjects[i].colliding = false;
                }

                TestBedApp.testObjects[i].update(delta);
            }
        }
    }
}


class TestObject
{
    bounds;
    gfx;
    travelVectorX;
    travelVectorY;
    color;

    colliding = false;

    constructor(x,y,width,height, color)
    {
        this.bounds = new PIXI.Rectangle(x,y,width,height);

        this.gfx = new PIXI.Graphics();
        this.gfx.beginFill(color);
        this.gfx.drawRect(x, y, width, height);
        
        // Add it to the stage to render
        TestBedApp.app.stage.addChild(this.gfx);

        this.travelVectorX = getRandomArbitrary(-15,15) * 5;
        this.travelVectorY = getRandomArbitrary(-15,15) * 5;

        this.color = color;
    }

    update(delta)
    {
        this.gfx.x += this.travelVectorX / (delta);
        this.gfx.y += this.travelVectorY / (delta);

        if(this.gfx.x < 0 || this.gfx.x > TestBedApp.app.screen.width - this.gfx.width)
        {
            this.travelVectorX = -this.travelVectorX;
        }

        if(this.gfx.y < 0 || this.gfx.y > TestBedApp.app.screen.height - this.gfx.height)
        {
            this.travelVectorY = -this.travelVectorY;
        }

        this.bounds.x = this.gfx.x;
        this.bounds.y = this.gfx.y;

        if(this.colliding == true)
        {
            this.gfx.tint = 0xFF0000;
        }
        else
        {
            this.gfx.tint = 0xFFFFFF;
        }
    }
}


window.onload = function()
{

    // Use the native window resolution as the default resolution
    // will support high-density displays when rendering
    PIXI.settings.RESOLUTION = window.devicePixelRatio;

    // The application will create a renderer using WebGL, if possible,
    // with a fallback to a canvas render. It will also setup the ticker
    // and the root stage PIXI.Container
    const app = new PIXI.Application({width: 1024, height: 800, backgroundColor: 0xdbdbdb});
    


    // The application will create a canvas element for you that you
    // can then insert into the DOM
    document.body.appendChild(app.view);

    window.testBedApp = new TestBedApp(app);
}

function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}