CREATE TABLE category (
   id serial primary key,
   category_type text NOT NULL
);

CREATE TABLE expense (
   id serial primary key,
   expense text not null,
   amount numeric not null, 
   total numeric not null,  
   category_id int not null,
    FOREIGN KEY(category_id) REFERENCES category(id)
);


