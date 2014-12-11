class GuestsController < ApplicationController
   before_filter :find_group, only: [:new, :create, :destroy]  
   before_filter :authenticate 

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

   def destroy
      @guest = Guest.find(params[:id])
      @guest.delete unless @guest.nil?
      redirect_to @group
   end

   private 
   def guest_params
      params.require(:guest).permit(:name)
   end

   def find_group
      @group = Group.find(params[:group_id])
   end
end
