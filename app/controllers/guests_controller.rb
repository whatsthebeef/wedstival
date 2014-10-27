class GuestsController < ApplicationController
   before_filter :find_group, only: [:new, :create]  

   def new
      @guest = Guest.new 
   end

   def create
      @guest = Guest.new(guest_params)
      @guest.group = @group
      if @guest.save
         redirect_to @guest.group
      else 
         render "new"
      end
   end

   private 
   def guest_params
      params.require(:guest).permit(:name)
   end

   def find_group
      @group = Group.find(params[:group_id])
   end
end
