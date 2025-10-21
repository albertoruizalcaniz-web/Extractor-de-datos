import { GoogleGenAI, Type } from "@google/genai";
import { EmployeeData } from '../types';

export async function extractDataFromPdfText(text: string): Promise<EmployeeData[]> {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set. Please ensure it is configured.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `
                Extrae el nombre del empleado ("Nombre de empleado") y sus horas semanales ("jornada semanal en horas/sem") del siguiente texto.
                El texto ha sido extraído de un PDF y puede contener errores de formato.
                Por favor, identifica todas las entradas de empleados.
                
                Texto a analizar:
                ---
                ${text}
                ---
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            employeeName: {
                                type: Type.STRING,
                                description: "The full name of the employee.",
                            },
                            weeklyHours: {
                                type: Type.STRING,
                                description: "The weekly work hours, including units like 'horas/sem'.",
                            },
                        },
                        required: ["employeeName", "weeklyHours"],
                    },
                },
            },
        });
        
        const jsonString = response.text;
        const parsedData = JSON.parse(jsonString);

        if (!Array.isArray(parsedData)) {
            throw new Error("La API no devolvió una matriz válida.");
        }

        // Validate structure
        const validatedData = parsedData.filter(item => 
            typeof item === 'object' &&
            item !== null &&
            'employeeName' in item &&
            'weeklyHours' in item
        );

        return validatedData as EmployeeData[];

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("No se pudieron extraer datos del texto. El modelo de IA no pudo procesar la solicitud.");
    }
}