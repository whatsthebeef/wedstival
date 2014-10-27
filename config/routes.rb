Wedstival::Application.routes.draw do
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end
  
  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
   
   # You can have the root of your site routed with "root"
   root 'static_pages#whats_all_this'

   # Example of regular route:
   get '/whats_all_this' => 'static_pages#whats_all_this', as: :whats_all_this
   get '/how_we_got_here' => 'static_pages#how_we_got_here', as: :how_we_got_here 
   get '/the_logistics' => 'static_pages#the_logistics', as: :the_logistics 
   get '/the_event' => 'static_pages#the_event', as: :the_event 
   get '/hotel_map' => 'static_pages#hotel_map', as: :hotel_map 
   get '/disclaimer' => 'static_pages#disclaimer', as: :disclaimer 

   resources :requests
   resources :groups do
      resources :guests
   end
end
