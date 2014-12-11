Wedstival::Application.routes.draw do
     
   # You can have the root of your site routed with "root"
   root 'static_pages#whats_all_this'

   # Example of regular route:
   get '/whats_all_this' => 'static_pages#whats_all_this', as: :whats_all_this
   get '/how_we_got_here' => 'static_pages#how_we_got_here', as: :how_we_got_here 
   get '/the_logistics' => 'static_pages#the_logistics', as: :the_logistics 
   get '/the_event' => 'static_pages#the_event', as: :the_event 
   get '/hotel_map' => 'static_pages#hotel_map', as: :hotel_map 
   get '/disclaimer' => 'static_pages#disclaimer', as: :disclaimer 

   get '/login' => 'user_sessions#new', as: :login
   get '/logout' => 'user_sessions#destroy', as: :logout

   resources :user_sessions

   get '/admin' => "admin#main_page", as: :admin
   get 'groups/rsvp/:code' => 'groups#rsvp', as: :rsvp
   post 'groups/:id/send_invite' => 'groups#send_invite', as: :send_invite

   resources :requests
   resources :groups do
      resources :guests
   end

end
