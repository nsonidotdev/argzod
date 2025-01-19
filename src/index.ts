

// const program = createProgram<"connect">();

// program.command(undefined, {
//     action: ({ commandArguments, options }) => {
//         console.log('Performing index action')
//         console.log(commandArguments, options)

//     },
//     commandArguments: [
//         { schema: z.coerce.number() }
//     ],
//     options: {}
// })

// program.command("connect", {
//     action: ({ commandArguments, options }) => {
//         console.log(`Connecting to the server... on port ${commandArguments[0]}`)
//         console.log(options)
//     },
//     commandArguments: [
//         { schema: z.coerce.number().min(1000)  },
//     ],
//     options: {
//         col: {
//             name: { long: "col", short: "c" },
//             description: "",
//             schema: z.coerce.number().min(0).max(100)
//         }
//     }
//     // commandArguments: [
//     //     { schema: z.any() },
//     //     { schema: z.coerce.number().catch(0).transform(arg => arg + 10) },
//     // ],
//     // options: {
//     //     filter: {
//     //         schema: z.string()
//     //             .refine(arg => {
//     //                 const items = arg.split(',').map(item => item.trim());
//     //                 console.log(items)
//     //                 return items.length > 1;
//     //             }, { message: "You should pass at least 2 arguments" })
//     //             .transform(arg => arg.split(",").map(i => i.trim())),
//     //         name: {
//     //             long: "filetra",
//     //             short: 'f'
//     //         },
//     //         description: "Does actualy nothing"
//     //     },
//     //     nvm: {
//     //         schema: z.coerce.number().default(1),
//     //         description: "Does actualy nothing"
//     //     },
//     //     force: {
//     //         name: {
//     //             long: "ajd",
//     //             short: "a"
//     //         }
//     //     }
//     // }
// })

// program.run(process.argv.slice(2));