class GroupsController < ApplicationController
   before_filter :find_group, only: [:edit, :update, :show, :send_invite, :destroy]  
   before_filter :authenticate, except: [:rsvp, :update] 

   def index
      if !params[:has_submitted].blank?
         @groups = Group.where_has_submitted(params[:has_submitted])
      elsif !params[:received_invite].blank?
         @groups = Group.where_received_invite(params[:received_invite])
      else
         @groups = Group.all
      end
   end

   def new
      @group = Group.new 
   end

   def create
      @group = Group.new(group_params)
      if @group.save
         redirect_to @group
      else 
         render "new"
      end
   end

   def edit
      session[:return_to] ||= request.referer
   end

   def update
      @group.update_attributes(group_params)
      if @group.save
         flash[:notice] = "Thanks for the reply..."
         if logged_in?
            redirect_to groups_path
         else
            redirect_to root_path
         end
      else 
         redirect_to session.delete(:return_to)
      end
   end

   def show 
   end

   def destroy
      @group.destroy
      redirect_to groups_path
   end

   def rsvp
      session[:return_to] ||= request.referer
      @group = Group.find_by_code(params[:code])
   end

   def send_invite
      begin
         @group.send_invite
         flash[:notice] = "Invite sent..."
         redirect_to groups_path
      rescue Exception => e
         puts "Caught exception #{e.message}!"
         flash[:notice] = "There was a problem sending the invite, please try again in a few minutes and if the problem continues contact the administrator."
         redirect_to @group
      end
   end

   private 
   def find_group
      @group = Group.find(params[:id])
   end

   def group_params
      params.require(:group).permit(:name, :code, :email, :has_submitted, :message, guests_attributes:[:is_coming, :id, :is_baby, :is_not_going_to_accept, :is_not_going_to_accept_probably])
   end
end
