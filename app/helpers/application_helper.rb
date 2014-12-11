module ApplicationHelper

   def responded(model, count, negative_response=false) 
      %{#{count} #{count == 1 ? model + " has" : model.pluralize + " have"} 
         #{negative_response ? "not" : ""} responded}
   end

   def count(model, count) 
      %{There #{count == 1 ? " is #{count} #{model}" : " are #{count} #{model.pluralize}"}} 
   end

   def coming(model, count) 
      %{#{count == 1 ? " #{count} #{model}" : " #{count} #{model.pluralize}"} coming} 
   end
end
