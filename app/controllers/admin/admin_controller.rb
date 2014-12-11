class Admin::AdminController < ApplicationController

   def main_page
      @groups = Group.last_five
   end

end
