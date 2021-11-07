
PIXI.Rectangle.prototype.intersects = function intersects(other)
{
    const x0 = this.x < other.x ? other.x : this.x;
    const x1 = this.right > other.right ? other.right : this.right;
    if (x1 <= x0)
    {
        return false;
    }
    const y0 = this.y < other.y ? other.y : this.y;
    const y1 = this.bottom > other.bottom ? other.bottom : this.bottom;
    return y1 > y0;
};


/**
 * Determines whether the `other` Rectangle is contained within `this` Rectangle object.
 * Rectangles that occupy the same space are considered to be containing each other.
 * Rectangles without area (width or height equal to zero) can't contain anything,
 * not even other arealess rectangles.
 *
 * _Note: Only available with **@pixi/math-extras**._
 *
 * @method containsRect
 * @memberof PIXI.Rectangle#
 * @param {Rectangle} other - The Rectangle to fit inside `this`.
 * @returns {boolean} A value of `true` if `this` Rectangle contains `other`; otherwise `false`.
 */
 PIXI.Rectangle.prototype.containsRect = function containsRect(other)
 {
     if (other.width <= 0 || other.height <= 0)
     {
         return other.x > this.x && other.y > this.y && other.right < this.right && other.bottom < this.bottom;
     }
     return other.x >= this.x && other.y >= this.y && other.right <= this.right && other.bottom <= this.bottom;
 };


 class DataNode
 {
     bounds;
     data;

     constructor(bounds, data)
     {
         this.bounds = bounds;
         this.data = data;
     }
 }

class QuadNode extends PIXI.Rectangle
{

    nodes;
    data;

    constructor(x,y,width,height)
    {
        super(x,y,width,height);
        this.nodes = new Array();
        this.data = new Array();
    }

    addChildNode(leafNode)
    {
        this.nodes.push(leafNode);
    }

    insert(bounds, data)
    {
        if(this.containsRect(bounds) == true)
        {
            for(let i in this.nodes)
            {
                if(this.nodes[i].containsRect(bounds) == true)
                {
                    this.nodes[i].insert(bounds, data);
                    return;
                }
            }

            //Did the object go to a child of this node, if not
            this.data.push(new DataNode(bounds, data));
        }
    }

    remove(bounds, data)
    {

        for(let j in this.data)
        {
            if(this.data[j].data == data)
            {   
                this.data.splce(j, 1);
                return;
            }   
        }

        for(let i in this.nodes)
        {
            if(this.nodes[i].containsRect(bounds) == false)
            {
                this.remove(tbounds, data);
            }
        }
    }


    //Returns all data objects that interesct the bounds provided
    query(bounds)
    {

        let collisions = new Array();

        if(this.intersects(bounds) == true)
        {
            for(let j in this.data)
            {
                if(this.data[j].bounds.intersects(bounds))
                {
                    collisions.push(this.data[j]);
                }
            }
        }

        for(let i in this.nodes)
        {
            let collionObjects = this.nodes[i].query(bounds);
            if(collionObjects.length != 0)
            {
                collisions = collisions.concat(collionObjects);
            }
        }

        return collisions;
    }
}

class QuadTree extends PIXI.Container
{

    node;

    width;
    height;

    minWidth;
    minHeight;

    lineCollection = [];

    debugView = false;

    constructor(width, height, minWidth, minHeight)
    {
        super();

        this.width = width;
        this.height = height;

        this.minWidth = minWidth;
        this.minHeight = minHeight;
        
        this.node = this.makeBounds(0,0,this.width, this.height);
        this.buildLeafNodes(this.node, 1);


        while(this.lineCollection.length != 0)
        {
            this.addChild(this.lineCollection.pop());
        }
        
    }

    buildLeafNodes(parentBounds, depth)
    {

        //Last stop on the way down building the tree ?
        if(parentBounds.width <= this.minWidth && parentBounds.height <= this.minHeight) return; 
        
        //Top left quad
        let bounds = this.makeBounds(parentBounds.x,parentBounds.y, parentBounds.width / 2, parentBounds.height / 2);
        this.addBorder(bounds, (depth * 1000) << depth, depth);
        parentBounds.addChildNode(bounds);
        this.buildLeafNodes(bounds, depth+1);

        //Top right quad
        bounds = this.makeBounds(parentBounds.x + parentBounds.width / 2,parentBounds.y, parentBounds.width / 2, parentBounds.height / 2);
        this.addBorder(bounds,(depth * 1000) << depth, depth);
        parentBounds.addChildNode(bounds);
        this.buildLeafNodes(bounds, depth+1);

        //Bottom right quad
        bounds = this.makeBounds(parentBounds.x + parentBounds.width / 2,parentBounds.y + parentBounds.height / 2, parentBounds.width / 2, parentBounds.height / 2);
        this.addBorder(bounds,(depth * 1000) << depth,depth);
        parentBounds.addChildNode(bounds);
        this.buildLeafNodes(bounds, depth+1);

        //Bottom left quad
        bounds = this.makeBounds(parentBounds.x,parentBounds.y + parentBounds.height / 2, parentBounds.width / 2, parentBounds.height / 2);
        this.addBorder(bounds,(depth * 1000) << depth,depth);
        parentBounds.addChildNode(bounds);
        this.buildLeafNodes(bounds, depth+1);

    }

    addBorder(bounds, color, depth)
    {
        if(this.debugView == true)
        {
            let line = new PIXI.Graphics();
            line.lineStyle(1, color).drawRect(bounds.x-1, bounds.y-1, bounds.width-1, bounds.height-1);
            line.zindex = -depth * 10;
            this.lineCollection.push(line);
        }
    }

    makeBounds(x, y, width, height)
    {
        let newBounds = new QuadNode(x,y,width, height);
        return newBounds;
    }


    //inserts an object into the tree, bounds its the objects bounding rectangle and data is the object itself
    insert(bounds, data)
    {
       this.node.insert(bounds, data);
    }

    //Removes an object from the tree
    remove(bounds, data)
    {
        this.node.remove(bounds, data);
    }

    //Returns all objects that intersect with the bounds provided
    query(bounds)
    {
        return this.node.query(bounds);
    }

}