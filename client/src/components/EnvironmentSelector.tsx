import { useEnvironmentStore } from '@/store/environmentStore';

export default function EnvironmentSelector() {
  const { environments, currentEnvironment, setCurrentEnvironment } = useEnvironmentStore();

  return (
    <div className="p-5 border-t border-gray-100/20">
      <h3 className="text-xl font-semibold text-white mb-5 flex items-center cursor-pointer hover:text-bubble-primary transition-colors">
        Change Environment
        <span className="ml-2 text-bubble-primary text-sm">(Select to experience)</span>
      </h3>
      <div className="grid grid-cols-2 gap-6">
        {environments.map(env => (
          <div 
            key={env.id}
            className={`environment-preview rounded-xl overflow-hidden shadow-lg ${
              currentEnvironment?.id === env.id 
                ? 'border-4 border-bubble-primary ring-4 ring-bubble-primary ring-opacity-30' 
                : 'border-2 border-gray-200/20'
            } cursor-pointer transition-all hover:shadow-xl transform hover:-translate-y-2 hover:scale-[1.02]`}
            onClick={() => setCurrentEnvironment(env)}
          >
            <div className="relative">
              <img 
                src={env.imageUrl} 
                alt={env.name} 
                className="w-full h-44 object-cover" 
              />
              
              {/* Floating bubbles in environment preview */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="floating-bubble bubble-sm" 
                  style={{ top: '20%', left: '15%', opacity: 0.6 }}></div>
                <div className="floating-bubble bubble-xs" 
                  style={{ top: '60%', left: '75%', opacity: 0.6 }}></div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <span className="text-base font-medium text-white">{env.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
