class StaticPagesController < ApplicationController
   layout "base_layout", only: :how_we_got_here 

   def whats_all_this
   end

   def how_we_got_here
   end

   def the_logistics
   end

   def the_event
   end

   def requests
   end

   def hotel_map
   end
end
