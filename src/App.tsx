import { useState, useEffect, useRef } from 'react';
import { Overworld } from './classes/Overworld';

function App() {
	const [overworld, setOverworld] = useState<Overworld>();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		setOverworld(new Overworld({ element: containerRef.current }));
	}, [containerRef]);

	useEffect(() => {
		if (!overworld) return;

		overworld.init();

		return () => overworld.destroy();
	}, [overworld]);

	return (
		<>
			<div ref={containerRef} className='game'>
				<canvas className='game__canvas' width={352} height={198}></canvas>
			</div>
		</>
	);
}

export default App;
