const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var _ = require("lodash");
const app = express();

app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine", "ejs");

app.use(express.static("public"));

mongoose.connect("mongodb+srv://abhinay_rajput:abhi2812@rajput.jmqvlao.mongodb.net/todoDB").catch((err)=>console.log(err));

const options = {
  weekday: "long",
  day :"numeric",
  month : "long"
};

let today = new Date();

let day = today.toLocaleDateString("en-Us", options);

const itemSchema = {
  name : String
}

const customListSchema = {
  name : String,
  items : [itemSchema]
}

const customList = mongoose.model("customList", customListSchema);

const Item = mongoose.model("Item", itemSchema);




app.get("/", function (req, res) {

  Item.find({}).then((foundItems)=>{
  
  res.render("list", { listTitle: day , newItems:foundItems});

}).catch((err)=>console.log(err));
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  customList.findOne({name : customListName}).then((found)=>{
    if(!found)
    {
      //create a new list
      const List = new customList({
        name : customListName,
        items : []
      });

      List.save();

      res.redirect("/" + customListName);
    }
    else{
      // show an existing list

      res.render("list", {listTitle :found.name, newItems : found.items});
    }
  })

});

app.post("/", function(req, res){
    const item = req.body.newItem;
    const listtitle = req.body.list;
    
    const newItem = new Item({
      name : item
    });

    if(listtitle === day)
    {
        newItem.save();

        res.redirect("/");
    }

    else
    {
      customList.findOne({name : listtitle}).then((found)=>
      {
        found.items.push(newItem);
        found.save();
        res.redirect("/" + listtitle);
      });
    }

    
});

app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day)
  {
    Item.findByIdAndRemove(checkedItem).then(()=>console.log("Item deleted successfully"));
    res.redirect("/");
  }
  else{
    customList.findOneAndUpdate({name : listName}, {$pull : {items : {_id:checkedItem}}}).then();
    res.redirect("/" + listName);
  }
});

app.listen(3000, function () {
  console.log("Server is started on port 3000");
});
